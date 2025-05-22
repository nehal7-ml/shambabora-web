import { Layout } from '@/components/custom/layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Search } from '@/components/search'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ThemeSwitch from '@/components/theme-switch'
// import { TopNav } from '@/components/top-nav'
import { UserNav } from '@/components/user-nav'
import { RecentSales } from './components/recent-sales'
import { Overview } from './components/overview'
import { IconBuilding, IconPlant2, IconScale, IconTractor } from '@tabler/icons-react'
// import useIsAuthenticated from '@/hooks/use-is-authenticated'
// import useAuthentication from '@/hooks/use-authentication'
import useToken from '@/hooks/use-token'
import { useQuery } from '@tanstack/react-query'
import { getAllFarmersHarvests, getCollectionCenters, getCrops, getFarmers } from '@/helpers/api-helper'

export default function Dashboard() {
  // const navigate = useNavigate();

  const [token, setToken] = useToken('jwtToken', null);
  const { data: farmers, isLoading } = useQuery({
    queryKey: ["farmers"],
    queryFn: async () => {
      const response:any = await getFarmers();
      console.log(response);
      return response.data;
    },
  });

  const { data: harvests } = useQuery({
    queryKey: ["faharvests"],
    queryFn: async () => {
      const response:any = await getAllFarmersHarvests();

      // console.log(response);
      return response;
    },
  });

  if(token==null){
    setToken("test")
  }

  const { data: collectionCenters } = useQuery({
    queryKey: ["collectionCenters"],
    queryFn: async () => {
      const response:any = await getCollectionCenters();
      console.log(response);
      return response;
    },
  });

  const { data: crops } = useQuery({
    queryKey: ["crops"],
    queryFn: async () => {
      const response:any = await getCrops();
      console.log(response);
      return response;
    },
  });



  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header>
        {/* <TopNav links={topNav} /> */}
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>

      {/* ===== Main ===== */}
      <Layout.Body>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='analytics'>Analytics</TabsTrigger>
              {/* <TabsTrigger value='reports'>Reports</TabsTrigger> */}
              {/* <TabsTrigger value='notifications'>Notifications</TabsTrigger> */}
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Farmers
                  </CardTitle>
                  <IconTractor />

                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{farmers?.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    +0.1 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Harvests
                  </CardTitle>
                  <IconScale />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{harvests?.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    +10 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Collection Centers</CardTitle>
                  <IconBuilding />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{collectionCenters?.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    +2 from start
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Crops
                  </CardTitle>
                  <IconPlant2 />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{crops?.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    +3 from start
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Farmer Statistics</CardTitle>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Farmers</CardTitle>
                  <CardDescription>
                    You made {farmers?.length} registrations this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentSales farmers={farmers?.slice(0,3)}/>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Layout.Body>
    </Layout>
  )
}

// const topNav = [
//   {
//     title: 'Overview',
//     href: 'dashboard/overview',
//     isActive: true,
//   },
//   {
//     title: 'Customers',
//     href: 'dashboard/customers',
//     isActive: false,
//   },
//   {
//     title: 'Products',
//     href: 'dashboard/products',
//     isActive: false,
//   },
//   {
//     title: 'Settings',
//     href: 'dashboard/settings',
//     isActive: false,
//   },
// ]
