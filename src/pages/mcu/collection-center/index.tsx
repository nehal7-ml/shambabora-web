import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getAMCOSs, getCollectionCenters, getRVillages } from '@/helpers/api-helper'
import { connectArrays } from '@/lib/utils'

export default function Region() {
  const { data: collectionCenters, isLoading } = useQuery({
    queryKey: ["collectionCenters"],
    queryFn: async () => {
      const collectionCentersRes: any = await getCollectionCenters();
      const amcosRes: any = await getAMCOSs();
      const villageRes: any = await getRVillages();

      const data = connectArrays(collectionCentersRes.data,
        {
          amcos: amcosRes.data,
          village: villageRes.data,
        },
        [{
          mainKey: 'amcos',
          sourceArrayName: 'amcos',
          linkedKey: 'id',
          newPropertyName: 'amcos'
        }, {
          mainKey: 'village',
          sourceArrayName: 'village',
          linkedKey: 'id',
          newPropertyName: 'village'
        }])
      return data;
    },
  });

  console.log(collectionCenters);

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
            <h2 className='text-2xl font-bold tracking-tight'>Collection Centers </h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your collection centers
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {
            isLoading ? <div>Loading .....</div> : <DataTable data={collectionCenters ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

