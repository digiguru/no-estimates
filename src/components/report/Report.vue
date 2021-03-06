<template>
  <div class="report">
    <button class="btn btn-sm btn-site-primary" @click="show()">
      Report
    </button>
    <span class="current-value">Current Project Value: <span v-html="currency" /><span>{{ total() }}</span></span>

    <modal class="report-modal" name="report-modal" :height="500" :classes="['rounded']">
      <div class="mt-4">
        <h4>
          Status (Day: {{ currentDay }}) <button class="btn btn-sm btn-site-primary" @click="hide()">
            Close
          </button>
        </h4>
        <div class="tabs">
          <div class="tab rounded-top" :class="{'selected': tab == 'Report'}" @click="selectTab('Report')">
            Report
          </div>
          <div class="tab rounded-top" :class="{'selected': tab == 'Analysis'}" @click="selectTab('Analysis')">
            Summary
          </div>
          <div class="tab rounded-top" :class="{'selected': tab == 'Graphs'}" @click="selectTab('Graphs')">
            Graphs
          </div>
        </div>
        <table class="estimates">
          <tr>
            <td>Estimate for Total Project: </td>
            <td><input type="text" id="project-estimate" class="form-control" :value="projectEstimate"></td>
            <td>
              <button class="btn btn-sm btn-site-primary" @click="saveTotalProject">
                Save
              </button>
            </td>
          </tr>
          <tr>
            <td>Estimate for MVP (#1-11): </td>
            <td><input type="text" id="mvp-estimate" class="form-control" :value="mvpEstimate"></td>
            <td>
              <button class="btn btn-sm btn-site-primary" @click="saveMVP">
                Save
              </button>
            </td>
          </tr>
          <tr>
            <td>Re-estimate for Total project: </td>
            <td><input type="text" id="re-estimate" class="form-control" :value="reEstimate"></td>
            <td>
              <button class="btn btn-sm btn-site-primary" @click="saveReEstimate">
                Save
              </button>
            </td>
          </tr>
        </table>

        <div v-if="tab == 'Report'" class="scroller">
          <table class="results">
            <thead>
              <tr>
                <th>Card #</th>
                <th>Effort</th>
                <th>Commit<br>Day</th>
                <th>Delivery<br>Day</th>
                <th>Delivery<br>Time</th>
                <th>Total<br><span v-html="currency" /><span>{{ total() }}</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(card, index) in workCards" :key="index">
                <td>{{ card.number }}</td>
                <td>{{ totalEffort(card) }}</td>
                <td><span v-if="card.commit > 0">{{ card.commit }}</span></td>
                <td>{{ card.delivery }}</td>
                <td :class="{ 'not-delivered': !card.delivery }">
                  {{ time(card) }}
                </td>
                <td>{{ card.value }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="tab == 'Analysis'">
          <table class="summary">
            <tr>
              <td>Correlation between Effort and Delivery Time: </td><td>{{ correlation() }}</td>
            </tr>
          </table>
        </div>

        <div v-if="tab == 'Graphs'" />
      </div>
    </modal>
  </div>
</template>

<script>
import stats from '../../lib/stats.js'

export default {
  props: [
    'socket'
  ],
  data() {
    return {
      tab: 'Report'
    }
  },
  computed: {
    currency() {
      return this.$store.getters.getCurrency
    },
    gameName() {
      return this.$store.getters.getGameName
    },
    teamName() {
      return this.$store.getters.getTeamName
    },
    workCards() {
      return this.$store.getters.getWorkCards
    },
    currentDay() {
      return this.$store.getters.getCurrentDay
    },
    projectEstimate() {
      return this.$store.getters.getProjectEstimate
    },
    mvpEstimate() {
      return this.$store.getters.getMVPEstimate
    },
    reEstimate() {
      return this.$store.getters.getReEstimate
    },
  },
  mounted() {
    this.socket.on('updateProjectEstimate', (data) => {
      if (this.gameName == data.gameName && this.teamName == data.teamName) {
        this.$store.dispatch('updateProjectEstimate', data)
      }
    })
    this.socket.on('updateMVPEstimate', (data) => {
      if (this.gameName == data.gameName && this.teamName == data.teamName) {
        this.$store.dispatch('updateMVPEstimate', data)
      }
    })
    this.socket.on('updateReEstimate', (data) => {
      if (this.gameName == data.gameName && this.teamName == data.teamName) {
        this.$store.dispatch('updateReEstimate', data)
      }
    })
  },
  methods: {
    show () {
      this.$modal.show('report-modal')
    },
    hide () {
      this.$modal.hide('report-modal')
    },
    selectTab(tab) {
      this.tab = tab
    },
    time(card) {
      let t
      if (card.delivery) {
        t = card.delivery - card.commit
      } else if (card.commit) {
        t = this.currentDay - card.commit
      } else {
        t= ''
      }
      return t
    },
    totalEffort(card) {
      return card.design +
        card.develop +
        card.test +
        card.deploy
    },
    total() {
      let total = 0
      for (let i = 0; i < this.workCards.length; i++) {
        if (this.workCards[i].value) {
          total += this.workCards[i].value
        }
      }
      return total
    },
    correlation() {
      const effort = [], deliveryTime = []
      for (let i = 0; i < this.workCards.length; i++) {
        if (this.workCards[i].delivery) {
          const card = this.workCards[i]
          effort.push(this.totalEffort(card))
          deliveryTime.push(card.delivery - card.commit)
        }
      }
      return effort.length == 0 ? 0 : stats.pCorrelation(effort, deliveryTime).toFixed(2)
    },
    saveTotalProject() {
      const estimate = document.getElementById('project-estimate').value
      this.socket.emit('updateProjectEstimate', {gameName: this.gameName, teamName: this.teamName, projectEstimate: estimate})
    },
    saveMVP() {
      const estimate = document.getElementById('mvp-estimate').value
      this.socket.emit('updateMVPEstimate', {gameName: this.gameName, teamName: this.teamName, mvpEstimate: estimate})
    },
    saveReEstimate() {
      const estimate = document.getElementById('re-estimate').value
      this.socket.emit('updateReEstimate', {gameName: this.gameName, teamName: this.teamName, reEstimate: estimate})
    }
  }
}
</script>

<style lang="scss">

   $orange: #f4511e;

  .report {
    display: inline-block;

    button {
      text-align: left;
      margin-top: 6px;
    }

    .current-value {
      position: relative;
      top: 3px;
      padding-left: 6px;
    }
  }

  .report-modal {

     h4 {
       text-align: center;
     }

    .tabs {
      border-bottom: 1px solid $orange;
      position: relative;
      margin-bottom: 4px;
      padding-left: 6px;

      .tab {
         width: 100px;
         padding: 4px;
         display: inline-block;
         text-align: center;
         background-color: #fff;
         position: relative;
         top: 1px;
         border-bottom: 1px solid $orange;

         &.selected {
           color: #fff;
           background-color: $orange;
           border-top: 1px solid;
           border-left: 1px solid;
           border-right: 1px solid;
           border-bottom: 1px solid $orange;

         }
       }
     }

    .scroller {
      overflow-y: auto;
      height: 390px;
    }

    input {
      width: 50px;
      height: 24px;
      margin: 0 auto;
      text-align: right;
    }

    button {
      height: 24px;
      line-height: 12px;
      margin: 6px;
    }

    table {
      margin: 6px auto;
      font-size: small;
      width: 98%;
    }

    th {
      padding: 4px;
      border: 1px solid;
    }

    td {
      padding: 0 4px;
      vertical-align: middle;
      text-align: center;
      border: 1px solid;
    }

    .estimates {
      width: 80%;
      margin: 0 auto;
    }

    .results {
      th {
        width: 16%;
        text-align: center;
      }

      .not-delivered {
        font-style: italic;
        color: #aaa;
        border-color: #444;
      }
    }

    .summary {
      width: 60%;
      margin-top: 24px;

      td {
        font-weight: bold;
        font-size: larger;
        padding: 12px;
      }
    }
  }


</style>
