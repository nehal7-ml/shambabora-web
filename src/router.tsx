import { createBrowserRouter } from 'react-router-dom'
import GeneralError from './pages/errors/general-error'
import NotFoundError from './pages/errors/not-found-error'
import MaintenanceError from './pages/errors/maintenance-error'
import UnauthorisedError from './pages/errors/unauthorised-error.tsx'
import RequireAuth from './helpers/require-auth.tsx'

const router = createBrowserRouter([
  // Auth routes
  {
    path: '/',
    lazy: async () => ({
      Component: (await import('./pages/home/views/Home.tsx')).default,
    }),
  },
  // {
  //   path: '/sign-in-other',
  //   lazy: async () => ({
  //     Component: (await import('./pages/auth/sign-in-other.tsx')).default,
  //   }),
  // },
  {
    path: '/sign-in',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-in.tsx')).default,
    }),
  },
  {
    path: '/sign-up',
    lazy: async () => ({
      Component: (await import('./pages/auth/sign-up')).default,
    }),
  },
  {
    path: '/forgot-password',
    lazy: async () => ({
      Component: (await import('./pages/auth/forgot-password')).default,
    }),
  },
  {
    path: '/otp',
    lazy: async () => ({
      Component: (await import('./pages/auth/otp')).default,
    }),
  },


  // Main routes
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/dashboard/*',
        lazy: async () => {
          const AppShell = await import('./components/app-shell')
          return { Component: AppShell.default }
        },
        errorElement: <GeneralError />,
        children: [
          {
            index: true,
            lazy: async () => ({
              Component: (await import('./pages/dashboard')).default,
            }),
          },
          {
            path: 'farmers',
            lazy: async () => ({
              Component: (await import('@/pages/farmers/farmer')).default,
            }),
          },
          {
            path: 'farmer-harvests/:id',
            lazy: async () => ({
              Component: (await import('@/pages/farmers/farmer-harvests/farmer-harvests.tsx')).default,
            }),
          },
          {
            path: 'farmers-harvests',
            lazy: async () => ({
              Component: (await import('@/pages/farmers/farmer-harvests')).default,
            }),
          },
          {
            path: 'harvest-details/:id',
            lazy: async () => ({
              Component: (await import('@/pages/farmers/farmer-harvests/harvest-details.tsx')).default,
            }),
          },
          {
            path: 'tasks',
            lazy: async () => ({
              Component: (await import('@/pages/tasks')).default,
            }),
          },
          {
            path: 'modules/training',
            lazy: async () => ({
              Component: (await import('@/pages/modules/training')).default,
            }),
          },
          {
            path: 'modules/sms-module',
            lazy: async () => ({
              Component: (await import('@/pages/modules/sms')).default,
            }),
          },
          {
            path: 'modules/training/:id',
            lazy: async () => ({
              Component: (await import('@/pages/modules/training/training.tsx')).default,
            }),
          },
          {
            path: 'crops',
            lazy: async () => ({
              Component: (await import('@/pages/crops/crops')).default,
            }),
          },
          {
            path: 'crop-types',
            lazy: async () => ({
              Component: (await import('@/pages/crops/crop-types')).default,
            }),
          },
          {
            path: 'measurement-units',
            lazy: async () => ({
              Component: (await import('@/pages/crops/measurement-units')).default,
            }),
          },
          {
            path: 'chats',
            lazy: async () => ({
              Component: (await import('@/pages/chats')).default,
            }),
          },
          {
            path: 'mcus',
            lazy: async () => ({
              Component: (await import('@/pages/mcu/mcu')).default,
            }),
          },
          {
            path: 'amcos',
            lazy: async () => ({
              Component: (await import('@/pages/mcu/amcos')).default,
            }),
          },
          {
            path: 'collection-center',
            lazy: async () => ({
              Component: (await import('@/pages/mcu/collection-center')).default,
            }),
          },
          {
            path: 'apps',
            lazy: async () => ({
              Component: (await import('@/pages/apps')).default,
            }),
          },
          {
            path: 'users',
            lazy: async () => ({
              Component: (await import('@/pages/users')).default,
            }),
          },
          {
            path: 'analysis',
            lazy: async () => ({
              Component: (await import('@/components/coming-soon')).default,
            }),
          },
          {
            path: 'extra-components',
            lazy: async () => ({
              Component: (await import('@/pages/extra-components')).default,
            }),
          },
          {
            path: 'regions',
            lazy: async () => ({
              Component: (await import('@/pages/locations/region')).default,
            }),
          },
          {
            path: 'districts',
            lazy: async () => ({
              Component: (await import('@/pages/locations/district')).default,
            }),
          },
          {
            path: 'wards',
            lazy: async () => ({
              Component: (await import('@/pages/locations/wards')).default,
            }),
          },
          {
            path: 'villages',
            lazy: async () => ({
              Component: (await import('@/pages/locations/village')).default,
            }),
          },
          {
            path: 'settings',
            lazy: async () => ({
              Component: (await import('./pages/settings')).default,
            }),
            // errorElement: <GeneralError />,
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('./pages/settings/profile')).default,
                }),
              },
              {
                path: 'account',
                lazy: async () => ({
                  Component: (await import('./pages/settings/account')).default,
                }),
              },
              {
                path: 'appearance',
                lazy: async () => ({
                  Component: (await import('./pages/settings/appearance')).default,
                }),
              },
              {
                path: 'notifications',
                lazy: async () => ({
                  Component: (await import('./pages/settings/notifications'))
                    .default,
                }),
              },
              {
                path: 'display',
                lazy: async () => ({
                  Component: (await import('./pages/settings/display')).default,
                }),
              },
              {
                path: 'error-example',
                lazy: async () => ({
                  Component: (await import('./pages/settings/error-example'))
                    .default,
                }),
                errorElement: <GeneralError className='h-[50svh]' minimal />,
              },
            ],
          },
        ],
      },
    ]
  },

  // Error routes
  { path: '/500', Component: GeneralError },
  { path: '/404', Component: NotFoundError },
  { path: '/503', Component: MaintenanceError },
  { path: '/401', Component: UnauthorisedError },

  // Fallback 404 route
  { path: '*', Component: NotFoundError },
])

export default router
