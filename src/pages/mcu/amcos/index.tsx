import { Layout } from '@/components/custom/layout'
import { Search } from '@/components/search'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
// import { regions } from './data/data'
import { useQuery } from '@tanstack/react-query'
import { getAMCOSs, getMCUs, getRDistrict, getRegions, getRVillages, getRWards } from '@/helpers/api-helper'
import { connectArrays, snakeToCamelCase } from "@/lib/utils"
import { useMemo } from 'react'
import { DataSchema } from './data/schema'

export default function Region() {
  const { data: amcos, isLoading } = useQuery({
    queryKey: ["amcos"],
    queryFn: async () => {
      const response: any = await getAMCOSs();
      console.log(response);
      return snakeToCamelCase(response.data);
    },
  });

  const { data: villages, isLoading: villageLoading } = useQuery({
    queryKey: ["villages"],
    queryFn: async () => {
      const response: any = await getRVillages();
      return response.data;
    }
  })
  const { data: districts, isLoading: districtLoading } = useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response: any = await getRDistrict();
      return response.data;
    }
  })
  const { data: wards, isLoading: wardLoading } = useQuery({
    queryKey: ["wards"],
    queryFn: async () => {
      const response: any = await getRWards();
      return response.data;
    }
  })
  const { data: regions, isLoading: regionLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response: any = await getRegions();
      return response.data;
    }
  })
  const { data: mcus, isLoading: mcuLoading } = useQuery({
    queryKey: ["mcus-select"],
    queryFn: async () => {
      const response: any = await getMCUs();
      return response.data;
    }
  })


  const amcosData = useMemo<DataSchema[]>(() => {
    if (isLoading || villageLoading || districtLoading || wardLoading || regionLoading || mcuLoading) return []
    const data = connectArrays(amcos,
      {
        mcu: mcus,
        region: regions,
        district: districts,
        ward: wards,
        village: villages,
      },

      [
        { mainKey: 'mcu', sourceArrayName: 'mcu', linkedKey: 'id', newPropertyName: 'mcu' },
        { mainKey: 'region', sourceArrayName: 'region', linkedKey: 'id', newPropertyName: 'region' },
        { mainKey: 'district', sourceArrayName: 'district', linkedKey: 'id', newPropertyName: 'district' },
        { mainKey: 'ward', sourceArrayName: 'ward', linkedKey: 'id', newPropertyName: 'ward' },
        { mainKey: 'village', sourceArrayName: 'village', linkedKey: 'id', newPropertyName: 'village' },
      ]
    )
    return data as DataSchema[]

  }, [amcos, mcus, regions, districts, wards, villages])

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
            <h2 className='text-2xl font-bold tracking-tight'>Amcos</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of Amcos
            </p>
          </div>
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
          {
            isLoading ? <div>Loading .....</div> : <DataTable data={amcosData ?? []} columns={columns} />
          }
        </div>
      </Layout.Body>
    </Layout>
  )
}

