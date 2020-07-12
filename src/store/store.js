import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    walkThrough: false,
    showAbout: false,
    host: false,
    gameName: '',
    myName: '',
    teamName: '',
    players: [],
    teams: [
      { name: 'Blue', members: []},
      { name: 'Green', members: []},
      { name: 'Purple', members: []},
      { name: 'Red', members: []}
    ],
    myEffort: {
      available: 4,
      assigned: 0,
      role: 'Tester'
    },
    roles: [
      {role: 'Designer', order: 1},
      {role: 'Developer', order: 2},
      {role: 'Tester', order: 3, name: 'Steve'},
      {role: 'Deployer', order: 4}
    ],
    columns: [
      {name: "Options", order: 1},
      {name: "Design", order: 2, cards: []},
      {name: "Develop", order: 3, cards: []},
      {name: "Test", order: 4, cards: []},
      {name: "Deploy", order: 5, cards: []},
      {name: "Done", order: 6, cards: []}
    ],
    numberOfDays: 30,
    currentDay: 1,
    eventCards: [
      {number: 1, text: "Perhaps you have delivered at least one card? If so, are you able to forecast when you might deliver the Minimum Viable Product, which the Product Owner has defined as cards #1-11 "},
      {number: 2, text: "In this game, you may have been committing to work on an individual work-item basis. Now a new Scrum Master has joined the comapny, and she wants you to do batch commitment (i.e. pull in as many stories at once as you belive you can accomplish in a week). Will you do this?"},
      {number: 3, text: "Testers and Developers want to sit together. You now have the option to fo concurrent Dev and Test (i.e. no need to finish Development effort before beginning Testing). Do you want to do this?"},
      {number: 4, text: "Did you remember that people can work in areas outside their speciality? They require two effort points to make one effort point in another area."},
      {number: 5, text: "You read that automoating deployments can lead to better quality and more predictable delivery. If you'd like to invest in that, you'll need to spend 8 effort points in Deploy (you can do this over multiple sprints)"},
      {number: 6, text: "If you decided yesterday to automate deployments, when you complete the delivery automation, you will no longer have to roll the die when you deploy."},
      {number: 7, text: "Good Luck!"},
      {number: 8, text: "Remember to roll the die when you attempt to deploy a completed card to see if the deployment was succesful."},
      {number: 9, text: "Pizza inspires your team to greatness! Add one to each person's capacity tomorrow."},
      {number: 10, text: "If you restructured your team yesterday, how do you expect the change to impact your forecast."},
      {number: 11, text: "Jim from accounting sales sends an email directing employees to make sure they're fully utilised (i.e. follow a policy that you do not leave capacity on the table). Do you obey or silently ignore him?"},
      {number: 12, text: "How much work in progress do you have? Has that changed from earlier?"},
      {number: 13, text: "Your oranisation has lost a tester so one of your testers now has to support multiple teams. One tester loses two points of effort tomorrow. (Disregard if you have no tester)"},
      {number: 14, text: "You have found that quality improves when you have someone pair with a Deployer. Roll an eight-sided die whenever you finish a work card, whenever someone in addition to Deployer works in deploy. (Disregard if you're doing automated delpoyments)"},
      {number: 15, text: "Would you like to restructure your team? Feel free to change role specialities or negotiate with other teams to bring on new members."},
      {number: 16, text: "Vince from the PMO says he's nervous that ypu're not producing enough according to your original estimate. As a result, he wants you to spend time re-estimating. Lock the team in a room for a day and do no delivery work tomorrow - update your estimate for delivering the entire project and move your day tracker one more day."},
      {number: 17, text: "Vince is satisfied with your estimate and sends it around to the business in an email titled 'Team commits to deadline'"},
      {number: 18, text: "Did you pair (more than one person worked on a sib=ngle card in one work stage) today? If so, tick off an extra point of work in each stage where the pairing occured (for today only)"},
      {number: 19, text: "When you have completed the MVP (cards 1 to 11), look at your estimates from earlier. How did you do? This time, try creating a probabilistic forecast for the rest of the backlog using the delivery-time data (ask the facilitator for help)."}
    ],
    currentEventCard: 0,
    workCards: [
      {number: 1, design: 6, develop: 7, test: 8, deploy: 2, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 2, design: 0, develop: 8, test: 6, deploy: 4, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 3, design: 10, develop: 9, test: 9, deploy: 3, urgent: true, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 4, design: 4, develop: 9, test: 12, deploy: 3, urgent: false, teamDependency: 4, dependentOn: '', commit: 0, blocked: false},
      {number: 5, design: 4, develop: 10, test: 5, deploy: 2, urgent: false, teamDependency: 4, dependentOn: '', commit: 0, blocked: false},
      {number: 6, design: 1, develop: 8, test: 2, deploy: 5, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 7, design: 1, develop: 10, test: 3, deploy: 1, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 8, design: 0, develop: 4, test: 3, deploy: 5, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 9, design: 10, develop: 4, test: 10, deploy: 6, urgent: false, teamDependency: 0, dependentOn: '', commit: 0, blocked: false},
      {number: 10, design: 1, develop: 7, test: 10, deploy: 8, urgent: true, teamDependency: 4, dependentOn: '', commit: 0, blocked: false}
    ],
    currentWorkCard: 0
  },
  getters: {
    getShowAbout: (state) => {
      return state.showAbout;
    },
    getWalkThrough: (state) => {
      return state.walkThrough;
    },
    getHost: (state) => {
      return state.host;
    },
    getGameName: (state) => {
      return state.gameName;
    },
    getMyName: (state) => {
      return state.myName;
    },
    getMyEffort: (state) => {
      return state.myEffort;
    },
    getTeamName: (state) => {
      return state.teamName;
    },
    getTeams: (state) => {
      return state.teams;
    },
    getNumberOfDays: (state) => {
      return state.numberOfDays;
    },
    getCurrentDay: (state) => {
      return state.currentDay;
    },
    getRoles: (state) => {
      return state.roles.sort(function(a, b) { return a.order > b.order });
    },
    getColumns: (state) => {
      return state.columns;
    },
    getCurrentEventCard: (state) => {
      if (state.currentEventCard < state.eventCards.length) {
        return state.eventCards[state.currentEventCard];
      } else {
        return false
      }
    },
    getCurrentWorkCard: (state) => {
      if (state.currentWorkCard < state.workCards.length) {
        return state.currentWorkCard
      } else {
        return false
      }
    },
    getWorkCards: (state) => {
      return state.workCards;
    }
  },
  mutations: {
    updateShowAbout: (state, payload) => {
      state.showAbout = payload;
    },
    updateWalkThrough: (state, payload) => {
      state.walkThrough = payload;
    },
    updateHost: (state, payload) => {
      state.host = payload;
    },
    updateGameName: (state, payload) => {
      state.gameName = payload;
    },
    updateMyName: (state, payload) => {
      state.myName = payload;
    },
    updateTeamName: (state, payload) => {
      state.teamName = payload;
    },
    addTeam: (state, payload) => {
      var found = false
      for (var i = 0; i < state.teams.length; i++) {
        if (state.teams[i] == payload) {
          found = true
        }
      }
      if (!found) {
        state.teams.push(payload)
      }
    },
    updateCurrentEventCard: (state, payload) => {
      state.currentEventCard = payload.currentEventCard;
    },
    updateCurrentDay: (state, payload) => {
      state.currentDay = payload.currentDay
    },
    updateColumns: (state, payload) => {
      state.columns = payload.columns
    },
    updateBlocked: (state, payload) => {
      for (var i = 1; i < state.columns.length; i++) {
        for (var j = 0; j < state.columns[i].cards.length; j++) {
          for (var k = 0; k < payload.blocked.length; k++) {
            if (state.columns[i].cards[j].number == payload.blocked[k]) {
              state.columns[i].cards[j].blocked = true
            } else {
              state.columns[i].cards[j].blocked = false
            }
          }
        }
      }
    },
    updateCurrentWorkCard: (state, payload) => {
      state.currentWorkCard = payload.currentWorkCard
    },
    updateDependentTeam: (state, payload) => {
      for (var i = 1; i < state.columns.length; i++) {
        for (var j = 0; j < state.columns[i].cards.length; j++) {
          var card = state.columns[i].cards[j]
          if (card.number == payload.workCard.number) {
            card.dependentOn = payload.dependentOn
          }
        }
      }
    }
  },
  actions: {
    updateShowAbout: ({ commit }, payload) => {
      commit("updateShowAbout", payload);
    },
    updateWalkThrough: ({ commit }, payload) => {
      commit("updateWalkThrough", payload);
    },
    updateHost: ({ commit }, payload) => {
      commit("updateHost", payload);
    },
    updateGameName: ({ commit }, payload) => {
      commit("updateGameName", payload);
    },
    updateMyName: ({ commit }, payload) => {
      commit("updateMyName", payload);
    },
    updateTeamName: ({ commit }, payload) => {
      commit("updateTeamName", payload);
    },
    addTeam: ({ commit }, payload) => {
      commit("addTeam", payload);
    },
    updateCurrentEventCard: ({ commit }, payload) => {
      commit("updateCurrentEventCard", payload);
    },
    updateCurrentWorkCard: ({ commit }, payload) => {
      commit("updateCurrentWorkCard", payload);
    },
    updateCurrentDay: ({ commit }, payload) => {
      commit("updateCurrentDay", payload);
    },
    updateColumns : ({ commit }, payload) => {
      commit("updateColumns", payload);
    },
    updateBlocked : ({ commit }, payload) => {
      commit("updateBlocked", payload);
    },
    updateDependentTeam: ({ commit }, payload) => {
      commit("updateDependentTeam", payload);
    }
  }
});
