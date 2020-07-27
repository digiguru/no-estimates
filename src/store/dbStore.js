
var initialRoles = [
  {role: 'Designer', order: 1, names: []},
  {role: 'Developer', order: 2, names: []},
  {role: 'Tester', order: 3, names: []},
  {role: 'Deployer', order: 4, names: []}
]

var initialTeams = [
  { name: 'Blue', otherCards: [], canStartAutoDeploy: false, autoDeploy: { doing: false, effort: 0, done: false } },
  { name: 'Green', otherCards: [], canStartAutoDeploy: false, autoDeploy: { doing: false, effort: 0, done: false } },
  { name: 'Purple', otherCards: [], canStartAutoDeploy: false, autoDeploy: { doing: false, effort: 0, done: false } },
  { name: 'Red', otherCards: [], canStartAutoDeploy: false, autoDeploy: { doing: false, effort: 0, done: false } }
]

var initialColumns = [
  {name: "options", order: 1},
  {name: "design", order: 2, cards: []},
  {name: "develop", order: 3, cards: []},
  {name: "test", order: 4, cards: []},
  {name: "deploy", order: 5, cards: []},
  {name: "done", order: 6, cards: []}
]

function createNewGame(data) {

  var game = data
  game.roles = initialRoles
  game.teams = initialTeams
  game.columns = initialColumns
  game.gameName = data.gameName
  game.currentDay = 1
  game.currentEventCard = 0
  game.currentWorkCard = 0

  return game
}

function _loadGame(err, client, db, io, data, debugOn) {

  db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
    if (err) throw err;
    if (res) {
      if (debugOn) { console.log("Loading game '" + data.gameName + "', team '" + data.teamName + "'") }
      io.emit("loadGame", res)
      client.close();
    } else {
      var i, games = [], gameTeams = [], game = createNewGame(data)
      for (i = 0; i < initialTeams.length; i++) {
        game.teamName = initialTeams[i].name
        gameTeams.push(game.teamName)
        games.push(JSON.parse(JSON.stringify(game)))
      }
      if (debugOn) { console.log("Created new game '" + data.gameName + "', teams '" + gameTeams.join(', ') + "'") }
      db.collection('games').insertMany(games, function(err, res) {
      if (err) throw err;
      for (i = 0; i < games.length; i++) {
        io.emit("loadGame", games[i])
      }
      _updateRole(err, client, db, io, data)
    })
    }
  })
}

function _updateRole(err, client, db, io, data) {

  db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
    if (err) throw err;
    if (res) {
      var i, j, roles = res.roles
      for (i = 0; i < roles.length; i++) {
        var names = []
        for (j = 0; j < roles[i].names.length; j++) {
          if (roles[i].names[j] != data.name) {
            names.push(roles[i].names[j])
          }
        }
        roles[i].names = names
      }
      for (i = 0; i < roles.length; i++) {
        if (roles[i].role == data.role) {
          roles[i].names.push(data.name)
        }
      }
      db.collection('games').updateOne({"_id": res._id}, {$set: {roles: roles}}, function(err, res) {
        if (err) throw err;
        data.roles = roles
        io.emit("updateRoles", data)
      })
    }
  })
}

function cardValue(workCards, card) {
  if (!card.urgent) {
    if (card.delivery < 3) {
      card.value = 700
    } else if (card.delivery < 6) {
      card.value = 400
    } else {
      card.value = 200
    }
  } else {
    card.value = -100 * card.delivery
  }
  for (var i = 0; i < state.workCards.length; i++) {
    if (workCards[i].number == card.number) {
      workCards[i].delivery = card.delivery
      workCards[i].value = card.value
    }
  }
}

function cardComplete(card, colName) {
  return !card.blocked && card[colName] == card.effort[colName] && (card.teamDependency == 0 || card.teamDependency == card.dependencyDone)
}

function moveCard(columns, workCards, card, n, currentDay) {
  var fromCol = columns[n]
  var toCol = columns[n + 1]
  var i, cards = []
  for (i = 0; i < fromCol.cards.length; i++) {
    if (fromCol.cards[i].number != card.number) {
      cards.push(fromCol.cards[i])
    }
  }
  fromCol.cards = cards
  if (toCol.name == 'done') {
    card.done = true
    card.delivery = currentDay
    card.time = card.delivery - card.commit
    cardValue(workCards, card)
  }
  toCol.cards.push(card)
}

module.exports = {

  updateRole: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateRole', data) }

    _updateRole(err, client, db, io, data)
  },

  loadGame: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('loadGame', data) }

    _loadGame(err, client, db, io, data, debugOn)
  },

  restartGame: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('restartGame', data) }

    db.collection('games').deleteMany({gameName: data.gameName}, function(err, res) {
      _loadGame(err, client, db, io, data, debugOn)
      io.emit("restartGame", data)
    })
  },

  updateCurrentDay: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateCurrentDay', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var teams = res.teams, currentDay = res.currentDay + 1
        for (var i = 0; i < teams.length; i++) {
          if (teams[i].name == data.teamName) {
            if (data.autoDeploy) {
              teams[i].autoDeploy.doing = true
            }
            if (data.canStartAutoDeploy) {
              teams[i].canStartAutoDeploy = true
            }
          }
        }
        data.teams = teams
        db.collection('games').updateOne({"_id": res._id}, {$set: {currentDay: currentDay, teams: teams}}, function(err, res) {
          io.emit("updateCurrentDay", data)
          io.emit("updateTeams", data)
          client.close()
        })
      }
    })
  },

  updateCurrentWorkCard: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateCurrentWorkCard', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        db.collection('games').updateOne({"_id": res._id}, {$set: {currentWorkCard: data.currentWorkCard}}, function(err, res) {
          if (err) throw err;
          io.emit("updateCurrentWorkCard", data)
          client.close();
        })
      }
    })
  },

  updateCurrentEventCard: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateCurrentEventCard', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        db.collection('games').updateOne({"_id": res._id}, {$set: {currentEventCard: data.currentEventCard}}, function(err, res) {
          if (err) throw err;
          io.emit("updateCurrentEventCard", data)
          client.close();
        })
      }
    })
  },

  updateColumns: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateColumns', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var columns = data.columns, workCards = res.workCards
        for (var i = 1; i < columns.length; i++) {
          for (var j = 0; j < columns[i].cards.length; j++) {
            var card = columns[i].cards[j]
            var colName = columns[i].name
            if (cardComplete(card, colName)) {
              moveCard(columns, workCards, card, i, res.currentDay)
            }
          }
        }
        db.collection('games').updateOne({"_id": res._id}, {$set: {columns: columns}}, function(err, res) {
          if (err) throw err;
          io.emit("updateColumns", data)
          client.close();
        })
      }
    })
  },

  updateQueues: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateQueues', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var i, j, k, columns = res.columns, workCards = res.workCards
        for (i = 1; i < columns.length; i++) {
          for (j = 0; j < columns[i].cards.length; j++) {
            for (k = 0; k < data.blocked.length; k++) {
              if (columns[i].cards[j].number == data.blocked[k]) {
                columns[i].cards[j].blocked = true
              } else {
                columns[i].cards[j].blocked = false
              }
            }
            for (k = 0; k < data.failed.length; k++) {
              if (columns[i].cards[j].number == data.failed[k]) {
                columns[i].cards[j].failed = true
                columns[i].cards[j].effort.deploy = 0
              }
            }
          }
        }
        db.collection('games').updateOne({"_id": res._id}, {$set: {columns: columns, workCards: workCards}}, function(err, res) {
          if (err) throw err;
          io.emit("updateColumns", columns)
        })
      }
    })
  },

  updateDependentTeam: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateDependentTeam', data) }

    db.collection('games').find({gameName: data.gameName}).toArray(function(err, res) {
      if (err) throw err;
      if (res.length) {
        team = res[0]
        var i, j, columns = team.columns
        for (i = 1; i < columns.length; i++) {
          for (j = 0; j < columns[i].cards.length; j++) {
            var card = columns[i].cards[j]
            if (card.number == data.workCard.number) {
              card.dependentOn = data.dependentOn
            }
          }
        }
        var teams = team.teams
        for (i = 0; i < teams.length; i++) {
          var otherCards = []
          for (j = 0; j < teams[i].otherCards.length; j++) {
            if (teams[i].otherCards[j].number != data.workCard.number) {
              otherCards.push(teams[i].otherCards[j])
            }
          }
          teams[i].otherCards = otherCards
        }
        for (i = 0; i < teams.length; i++) {
          if (teams[i].name == data.dependentOn.name) {
            data.workCard.team = data.teamName
            teams[i].otherCards.push(data.workCard)
          }
        }
        for (var r = 0; r < res.length; r++) {
          if (typeof(res[r]) != "undefined") {
            data.teamName = res[r].teamName
            data.teams = teams
            io.emit("updateTeams", data)
            data.columns = columns
            io.emit("updateColumns", data)
            db.collection('games').updateOne({"_id": res[r]._id}, {$set: {teams: teams, columns: columns}}, function(err, res) {
              if (err) throw err;
            })
          }
        }
      }
    })
  },

  updateEffort: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('updateEffort', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var columns = res.columns, workCards = res.workCards
        for (var i = 1; i < columns.length; i++) {
          for (var j = 0; j < columns[i].cards.length; j++) {
            if (columns[i].cards[j].number == data.workCard.number) {
              var card = columns[i].cards[j]
              var colName = columns[i].name
              card.effort = data.workCard.effort
              if (cardComplete(card, colName)) {
                moveCard(columns, workCards, card, i, res.currentDay)
              }
            }
          }
        }
        data.columns = columns
        db.collection('games').updateOne({"_id": res._id}, {$set: {columns: columns, workCards: workCards}}, function(err, res) {
          io.emit("updateColumns", data)
          client.close()
        })
      }
    })
  },

  addEffortToOthersCard: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('addEffortToOthersCard', data) }

    db.collection('games').find({gameName: data.gameName}).toArray(function(err, res) {
      if (err) throw err;
      if (res.length) {
        team = res[0]
        var i, j, columns = team.columns, teams = team.teams, workCards = team.workCards
        for (i = 1; i < columns.length; i++) {
          for (j = 0; j < columns[i].cards.length; j++) {
            if (columns[i].cards[j].number == data.card.number) {
              var card = columns[i].cards[j]
              var colName = columns[i].name
              card.dependencyDone = card.dependencyDone + 1
              if (cardComplete(card, colName)) {
                moveCard(columns, workCards, card, i, team.currentDay)
              }
            }
          }
        }
        for (i = 0; i < teams.length; i++) {
          for (j = 0; j < teams[i].otherCards.length; j++) {
            if (teams[i].otherCards[j].number ==  data.card.number) {
              teams[i].otherCards[j].dependencyDone = teams[i].otherCards[j].dependencyDone + 1
            }
          }
        }
        for (var r = 0; r < res.length; r++) {
          if (typeof(res[r]) != "undefined") {
            data.teamName = res[r].teamName
            data.teams = teams
            io.emit("updateTeams", data)
            data.columns = columns
            io.emit("updateColumns", data)
            db.collection('games').updateOne({"_id": res[r]._id}, {$set: {teams: teams, columns: columns}}, function(err, res) {
              if (err) throw err;
            })
          }
        }
      }
    })
  },

  startAutoDeploy: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('startAutoDeploy', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var teams = res.teams
        for (var i = 0; i < teams.length; i++) {
          if (teams[i].name == data.teamName) {
            teams[i].autoDeploy.doing = true
          }
        }
        data.teams = teams
        db.collection('games').updateOne({"_id": res._id}, {$set: {teams: teams}}, function(err, res) {
          if (err) throw err;
          io.emit("updateTeams", data)
          client.close();
        })
      }
    })
  },

  incrementAutoDeploy: function(err, client, db, io, data, debugOn) {

    if (debugOn) { console.log('incrementAutoDeploy', data) }

    db.collection('games').findOne({gameName: data.gameName, teamName: data.teamName}, function(err, res) {
      if (err) throw err;
      if (res) {
        var teams = res.teams
        for (var i = 0; i < teams.length; i++) {
          if (teams[i].name == data.teamName) {
            teams[i].autoDeploy.effort = teams[i].autoDeploy.effort + 1
            if (teams[i].autoDeploy.effort == 8) {
              teams[i].autoDeploy.doing = false
              teams[i].autoDeploy.done = true
            }
          }
        }
        data.teams = teams
        db.collection('games').updateOne({"_id": res._id}, {$set: {teams: teams}}, function(err, res) {
          if (err) throw err;
          io.emit("updateTeams", data)
          client.close();
        })
      }
    })
  }

}
