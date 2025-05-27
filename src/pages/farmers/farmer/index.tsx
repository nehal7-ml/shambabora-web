import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getAMCOSs, getFarmers, getUsersWithRole } from '@/helpers/api-helper'
import { connectArrays, snakeToCamelCase } from '@/lib/utils'
import { useMemo } from 'react'
import { DataSchema } from './data/schema'

export default function Farmer() {
  const { data: farmers, isLoading } = useQuery({
    queryKey: ["farmers"],
    queryFn: async () => {
      const response: any = await getFarmers();
      return snakeToCamelCase(response.data);
    },
  });
  const { data: amcos, isLoading: amcosLoading } = useQuery({
    queryKey: ["amcos"],
    queryFn: async () => {
      const response: any = await getAMCOSs();
      return response.data;
    }
  }
  )

  const { data: farmerUser, isLoading: farmerUserLoading } = useQuery({
    queryKey: ["farmerUser"],
    queryFn: async () => {
      const response: any = await getUsersWithRole('farmer');
      return snakeToCamelCase(response.data);
    },
  });


  const farmerData = useMemo<DataSchema[]>(() => {
    if (isLoading || farmerUserLoading || amcosLoading) return []
    const data = connectArrays<DataSchema>(farmers, {
      amcos: amcos,
      farmerUser: farmerUser
    }, [
      { mainKey: 'amcos', sourceArrayName: 'amcos', linkedKey: 'id', newPropertyName: 'amcos' },
      { mainKey: 'user', sourceArrayName: 'farmerUser', linkedKey: 'id', newPropertyName: 'user' }
    ])

    return data
  }, [farmers, amcos, farmerUser, isLoading, amcosLoading])

  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      <Layout.Header sticky>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>

      <Layout.Body>
        <div className='mb-2 flex items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Farmers List</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of all Farmers
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {
            isLoading ? <div>Loading .....</div> : <DataTable data={farmerData ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

