import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getCrops, getCropTypes, getMeasurementUnit } from '@/helpers/api-helper'
import { connectArrays } from '@/lib/utils'
import { useMemo } from "react"
import { DataSchema } from "./data/schema"

export default function Region() {
  const { data: crops, isLoading } = useQuery({
    queryKey: ["crops"],
    queryFn: async () => {
      const cropsRes: any = await getCrops();
      return cropsRes.data;
      // used to link relations data read the jsDoc of connectArrays
     
    },
  });

  const { data: cropsTypesRes, isLoading: isCropTypesLoading } = useQuery({
    queryKey: ["crops-types"],
    queryFn: async () => {
      const response: any = await getCropTypes();
      return response.data;
    },
  });

  const { data: uomTypesRes, isLoading: isUomTypesLoading } = useQuery({
    queryKey: ["uom-types"],
    queryFn: async () => {
      const response: any = await getMeasurementUnit();
      return response.data;
    },
  });

  const cropsData = useMemo<DataSchema[]>(() => {
    if (isLoading || isCropTypesLoading || isUomTypesLoading) return
    const data = connectArrays<DataSchema>(crops,
      {
        cropTypes: cropsTypesRes,
        uom: uomTypesRes,
      },
      [{ mainKey: 'type', linkedKey: 'id', newPropertyName: 'type', sourceArrayName: 'cropTypes', },
      { mainKey: 'uom', linkedKey: 'id', newPropertyName: 'uom', sourceArrayName: 'uom', }]
    )
    return data
  },[crops, cropsTypesRes, uomTypesRes, isLoading, isCropTypesLoading, isUomTypesLoading])


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
            <h2 className='text-2xl font-bold tracking-tight'>Crop </h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your crop
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {
            isLoading ? <div>Loading .....</div> : <DataTable data={cropsData ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

