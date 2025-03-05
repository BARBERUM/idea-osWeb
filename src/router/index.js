import { createRouter, createWebHistory } from 'vue-router';

import home from '../views/homePage.vue'
import dynamic_partition from '../views/dynamic_partition.vue'
import paging_management from '../views/paging_management.vue'

const routes=[
    {path:'/', component:home,meta:{transition:'fade'}},
    {path:'/dynamicPartition', component:dynamic_partition,meta:{transition:'slide-left'}},
    {path:'/pagingManagement', component:paging_management,meta:{transition:'slide-left'}},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;