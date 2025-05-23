import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getAllFarmersHarvests, getAMCOSs, getCollectionCenters, getCrops, getUsersWithRole } from '@/helpers/api-helper'
import { connectArrays, snakeToCamelCase } from "@/lib/utils"
import { useMemo } from 'react'
import { DataSchema } from './data/schema'

export default function Harvests() {
  const { data: harvests, isLoading } = useQuery({
    queryKey: ["farmer-harvests"],
    queryFn: async () => {
      const response: any = await getAllFarmersHarvests();
      return snakeToCamelCase(response.data);
    },
  });

  const { data: farmers, isLoading: isFarmersLoading } = useQuery({
    queryKey: ["user-farmers"],
    queryFn: async () => {
      const response = await getUsersWithRole("farmer");
      return snakeToCamelCase(response.data);
    }
  })
  const { data: admins, isLoading: isAdminsLoading } = useQuery({
    queryKey: ["amcos-admins"],
    queryFn: async () => {
      const response = await getUsersWithRole("amcos_admin");
      return response.data;
    }
  })

  const { data: unionAdmins, isLoading: isUnionAdminsLoading } = useQuery({
    queryKey: ["union-admins"],
    queryFn: async () => {
      const response = await getUsersWithRole("union_admin");
      return response.data;
    }
  })

  const { data: crops, isLoading: isCropsLoading } = useQuery({
    queryKey: ["crops"],
    queryFn: async () => {
      const response = await getCrops()
      return response.data
    }
  })

  const { data: amcos, isLoading: isAmcosLoading } = useQuery({
    queryKey: ["amcos"],
    queryFn: async () => {
      const response = await getAMCOSs()
      return response.data
    }
  })

  const { data: collectionCenters, isLoading: isCollectionCentersLoading } = useQuery({
    queryKey: ["collection-centers"],
    queryFn: async () => {
      const response = await getCollectionCenters()
      return response.data
    }
  })


  const harvestData = useMemo<DataSchema[]>(() => {
    if (isLoading || isAdminsLoading || isUnionAdminsLoading || isCropsLoading || isAmcosLoading || isCollectionCentersLoading) return
    const data = connectArrays(harvests,
      {
        amcos: amcos,
        collectionCenter: collectionCenters,
        crop: crops,
        receivedBy: admins.concat(unionAdmins),
        farmer: farmers
      }, [
      { mainKey: 'amcos', sourceArrayName: 'amcos', linkedKey: 'id', newPropertyName: 'amcos' },
      { mainKey: 'collectionCenter', sourceArrayName: 'collectionCenter', linkedKey: 'id', newPropertyName: 'collectionCenter' },
      { mainKey: 'crop', sourceArrayName: 'crop', linkedKey: 'id', newPropertyName: 'crop' },
      { mainKey: 'receivedBy', sourceArrayName: 'receivedBy', linkedKey: 'id', newPropertyName: 'receivedBy' },
      { mainKey: 'farmer', sourceArrayName: 'farmer', linkedKey: 'id', newPropertyName: 'farmer' }
    ])

    return data as DataSchema[]
  }, [harvests, farmers, amcos, collectionCenters, crops, admins, unionAdmins])

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
            isLoading ? <div>Loading .....</div> : <DataTable data={harvestData ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

