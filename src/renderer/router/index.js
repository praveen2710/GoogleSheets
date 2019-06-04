import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage/LandingPage').default
    },
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/settings',
      name: 'settings-page',
      component: require('@/components/SettingsPage/Settings').default
    },
    {
      path: '/company',
      name: 'company-page',
      component: require('@/components/CompanyPage/AddCompany').default
    },
    {
      path: '/partyNo',
      name: 'partyNo-page',
      component: require('@/components/PartyNoPage/AddPartyNo').default
    }
  ]
})
