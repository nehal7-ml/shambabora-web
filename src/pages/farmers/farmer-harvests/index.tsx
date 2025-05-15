import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getAllFarmersHarvests } from '@/helpers/api-helper'
import { snakeToCamelCase } from "@/lib/utils"

export default function Harvests() {
  const { data: harvests, isLoading } = useQuery({
    queryKey: ["farmer-harvests"],
    queryFn: async () => {
      const response: any = await getAllFarmersHarvests();
      return snakeToCamelCase(response);
    },
  });


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
            <h2 className='text-2xl font-bold tracking-tight'>All Farmer Harvests</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of Farmer Harvests
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {
            isLoading ? <div>Loading .....</div> : <DataTable data={harvests?.data ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

