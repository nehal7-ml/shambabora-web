import React, { useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { MapPin, Calendar, Phone, Mail, Home, PlusCircle, BadgeCheck, Fingerprint, IdCard, LoaderCircle } from 'lucide-react'
import { Layout } from '@/components/custom/layout'
import ThemeSwitch from '@/components/theme-switch'
import { UserNav } from '@/components/user-nav'
import { Search } from '@/components/search'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import {
  getAMCOSs,
  getCrops,
  getFarmerHarvests,
  getFarms,
  postFarms,
  retrieveFarmer,
  retrieveFarmerFarms,
} from '@/helpers/api-helper'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { addAlert } from '@/store/slices/elert-slice'
import { useAppDispatch } from '@/hooks/store-hooks'
import 'leaflet/dist/leaflet.css'
import { connectArrays, snakeToCamelCase } from '@/lib/utils'
import AddEditFarms from "../farms/components/add-edit-farms"
import CardActions from '../farms/components/card-actions'
import { FormSchema } from '../farms/data/formSchema'
import DeleteDialog from '../farms/components/delete-farm-dialog'
import { DataSchema } from '../farms/data/schema'
// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
})

interface Coordinate {
  latitude: string
  longitude: string
}

interface Farm {
  id: number
  name: string
  coordinates: Coordinate
  center: [number, number]
  farmSize: string
  cropName: string
}

interface MapModalProps {
  isOpen: boolean
  onClose: () => void
  farm: Farm
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, farm }) => {
  if (!farm) return null

  const polygonOptions = {
    color: 'blue',
    weight: 2,
    fillColor: '#2563eb',
    fillOpacity: 0.2,
  }

  function convertToLatLngArray(coordinates: Coordinate[]): [number, number][] {
    return coordinates.map(
      (coord) => [parseFloat(coord.latitude), parseFloat(coord.longitude)] as [number, number]
    )
  }

  const mapData = convertToLatLngArray([farm.coordinates])

  // Calculate the bounds to determine the center if not provided
  const calculateCenter = () => {
    if (farm.center) return farm.center

    const lats = mapData.map((coord) => coord[0])
    const lngs = mapData.map((coord) => coord[1])

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2

    return [centerLat, centerLng] as [number, number]
  }

  const centerPosition = calculateCenter()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='h-[600px] sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <span>{farm.name} - Farm Map</span>
            <Button variant='ghost' size='icon' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className='relative h-[500px] w-full'>
          <MapContainer
            center={centerPosition}
            zoom={17}
            style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />

            <Polygon positions={mapData} pathOptions={polygonOptions}>
              <Popup>
                <div className='p-2'>
                  <h3 className='font-semibold'>{farm.name}</h3>
                  <p className='text-sm'>Size: {farm.farmSize} acres</p>
                  <p className='text-sm'>Crops: {farm.cropName}</p>
                </div>
              </Popup>
            </Polygon>

            <Marker position={centerPosition}>
              <Popup>
                <div className='p-2'>
                  <h3 className='font-semibold'>{farm.name}</h3>
                  <p className='text-sm'>Center Point</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const FarmerDetailsPage = () => {
  const [selectedFarm, setSelectedFarm] = useState(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const params = useParams()
  const [openFarmForm, setOpenFarmForm] = useState(false)
  const [farmFormMode, setFarmFormMode] = useState<'add' | 'edit'>('add')
  const [farmInitialData, setFarmInitialData] = useState<DataSchema | null>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [formData, setFormData] = useState({

    name: '',
    farmSize: '',
    coordinates: [
      { x: '', y: '' },
      { x: '', y: '' },
    ],
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await postFarms(data)
    },
    onSuccess: () => {
      // Close the add farm dialog
      setOpenFarmForm(false)

      // Invalidate and refetch farms data
      queryClient.invalidateQueries({ queryKey: ['farmer-farms', params?.id] })

      // Show success message
      dispatch(
        addAlert({
          message: 'Farm added successfully!',
          title: 'Add Success',
          type: 'success',
        })
      )
    },
    onError: (error: any) => {
      dispatch(
        addAlert({
          message: error.message || 'Failed to add farm',
          title: 'Add Failed',
          type: 'error',
        })
      )
    },
  })

  const updateCoordinate = (index: number, field: 'x' | 'y', value: string) => {
    const newCoordinates = [...formData.coordinates]
    newCoordinates[index][field] = value
    setFormData({ ...formData, coordinates: newCoordinates })
  }

  // Fetch <Farmner></Farmner>
  const { data: farmer, isLoading: loadingFarmer } = useQuery({
    queryKey: ['farmer', params?.id],
    queryFn: async () => {
      const response: any = await retrieveFarmer(`${params?.id}`)
      return snakeToCamelCase(response);
    },
  });


  const { data: farms, isLoading: loadingFarms } = useQuery({
    queryKey: ['farms', params?.id],
    queryFn: async () => {
      if (!farmer) return null
      const farmsResponse: any = await retrieveFarmerFarms(`${farmer.user}`)
      return snakeToCamelCase(farmsResponse.data);
    },
    enabled: !!farmer,
  })


  const { data: harvests, isLoading: loadingHarvests } = useQuery({
    queryKey: ['harvests', params?.id],
    queryFn: async () => {
      if (!farmer) return null
      const harvestsResponse: any = await getFarmerHarvests(`${farmer.user}`)
      return snakeToCamelCase(harvestsResponse.data);
    },
    enabled: !!farmer,
  })

  const { data: crops, isLoading: loadingCrops } = useQuery({
    queryKey: ['crops', params?.id],
    queryFn: async () => {
      const response: any = await getCrops()
      return response.data
    },
  });

  const { data: amcos, isLoading: loadingAmcos } = useQuery({
    queryKey: ['amcos', params?.id],
    queryFn: async () => {
      const response: any = await getAMCOSs()
      return response.data
    },
  })

  const { farmerData, farmData, harvestData } = useMemo(() => {

    if (loadingFarmer || loadingFarms || loadingHarvests || loadingCrops) return { farmerData: null, farmData: null, harvestData: null }
    const harvestData = connectArrays(harvests, { crops: crops }, [
      { mainKey: 'crop', sourceArrayName: 'crops', linkedKey: 'id', newPropertyName: 'crop' }
    ])
    const farmData = connectArrays(farms, { amcos: amcos }, [
      { mainKey: 'amcos', sourceArrayName: 'amcos', linkedKey: 'id', newPropertyName: 'amcos' }
    ])

    return {
      farmerData: farmer,
      farmData: farmData,
      harvestData: harvestData
    }
  }, [farmer, farms, harvests, amcos, crops])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dta = {
      ...formData,
      farmer: params?.id,
      amcos: farmerData?.amcos,
    }
    await mutation.mutateAsync(dta)
  }



  const handleViewMap = (farmId: any) => {
    const farm = farmData.find((f: any) => f.id === farmId)
    console.log(farm)

    // @ts-ignore
    setSelectedFarm(farm)
    setIsMapOpen(true)
  }



  const calculateTotalArea = () => {
    if (!farmData) return 0
    return farmData.reduce((total: number, farm: any) => {
      return total + parseFloat(farm?.farmSize || 0)
    }, 0)
  }

  const totalArea = calculateTotalArea()

  const [selectedTab, setSelectedTab] = useState('details')

  const handleEditFarm = (farm: any) => {
    setFarmFormMode('edit')
    setFarmInitialData(farm)
    setOpenFarmForm(true)
  }
  const handleAddfarm = () => {
    setFarmFormMode('add')
    setFarmInitialData(null)
    setOpenFarmForm(true)
  }

  const handleDeleteFarm = (farm: any) => {
    setFarmInitialData(farm)
    setShowDeleteModal(true)
  }

  const isLoading = useMemo(() => {
    return loadingAmcos || loadingFarmer || loadingHarvests || loadingCrops
  }, [loadingAmcos, loadingFarmer, loadingHarvests, loadingCrops])
  return (
    <Layout>
      {/* ===== Top Heading ===== */}
      {/* ===== Top Heading ===== */}
      <Layout.Header sticky>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>
      <Layout.Body>
        {isLoading ? <div > <LoaderCircle className="animate-spin h-10 w-10 text-white" /> </div> :
          <div className=' '>
            {/* Header Section */}
            <div className='mb-8'>
              <Card className='p-6'>
                <div className='flex flex-col gap-6 md:flex-row'>
                  {/* Profile Picture */}
                  <div className='flex-shrink-0'>
                    <div className='flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-secondary/20'>
                      {!farmerData?.image ? (
                        <div className='flex h-full w-full items-center justify-center bg-primary text-3xl font-bold text-white'>
                          {farmerData?.firstName?.[0] ?? 'F'}
                          {farmerData?.lastName?.[0] ?? 'A'}
                        </div>
                      ) : (
                        <img
                          src={farmerData?.image}
                          alt={farmerData?.name}
                          className='h-full w-full object-cover'
                        />
                      )}
                    </div>
                  </div>

                  {/* Farmer Info */}
                  <div className='flex-grow'>
                    <div className='mb-4 flex flex-col justify-between md:flex-row'>
                      <div>
                        <h1 className='mb-2 text-3xl font-bold'>
                          {farmerData?.firstName} {farmerData?.lastName}
                        </h1>
                        <div className='mb-2 flex items-center gap-2'>
                          <Badge variant='outline' className='text-sm'>
                            ID: {farmerData?.idNumber}
                          </Badge>

                          <Badge
                            variant={
                              farmerData?.status === 'Active'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {farmerData?.status}
                          </Badge>
                        </div>
                      </div>
                      <div className='mt-4 flex gap-4 md:mt-0'>
                        {/* <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    
                  </Button> */}
                        <Button
                          variant='default'
                          size='sm'
                          onClick={handleAddfarm}
                        >
                          <PlusCircle className='mr-2 h-4 w-4' />
                          Add farm
                        </Button>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
                      <div className='rounded-lg bg-secondary/10 p-4'>
                        <div className='text-sm text-muted-foreground'>
                          Total Farms
                        </div>
                        <div className='text-2xl font-semibold'>
                          {farmData?.length || 0}
                        </div>
                      </div>
                      <div className='rounded-lg bg-secondary/10 p-4'>
                        <div className='text-sm text-muted-foreground'>
                          Active Area
                        </div>
                        <div className='text-2xl font-semibold'>
                          {totalArea || 0}
                        </div>
                      </div>
                      <div className='rounded-lg bg-secondary/10 p-4'>
                        <div className='text-sm text-muted-foreground'>
                          Total Harvests
                        </div>
                        <div className='text-2xl font-semibold'>
                          {farmData?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className='w-full'
            >
              <TabsList className='mb-8 grid w-full grid-cols-3'>
                <TabsTrigger value='details'>Farmer Details</TabsTrigger>
                <TabsTrigger value='farms'>Farms</TabsTrigger>
                <TabsTrigger value='harvests'>Harvest History</TabsTrigger>
              </TabsList>

              {/* Farmer Details Tab */}
              <TabsContent value='details'>
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className='w-full text-sm border border-muted rounded-md overflow-hidden'>
                      <tbody>
                        <TableRow label='Contact Number' value={farmerData?.phoneNumber} />
                        <TableRow label='TUME Number' value={farmerData?.tumeNumber || 'N/A'} />
                        <TableRow label='TIN Number' value={farmerData?.tinNumber || 'N/A'} />
                        {/* <TableRow label='Main Crop' value={crops?.split(',')[0] || 'N/A'} /> */}
                        <TableRow label='Education Level' value={farmerData?.educationLevel || 'N/A'} />
                        <TableRow label='Date of Birth' value={new Date(farmerData?.dob).toLocaleDateString()} />
                        <TableRow label='TTB Number' value={farmerData?.ttbNumber || 'N/A'} />
                        {/* <TableRow label='Secondary Crop' value={crops?.split(',')[1] || 'N/A'} /> */}
                        <TableRow label='Gender' value={farmerData?.sex} />
                        <TableRow label='Registration Date' value={new Date(farmerData?.createdAt).toLocaleDateString()} />
                        <TableRow label='ID Type' value={farmerData?.idType} />
                        <TableRow label='Voter ID' value={farmerData?.voterId || 'N/A'} />
                        <TableRow label='Drivers License' value={farmerData?.driversLicense || 'N/A'} />
                        <TableRow label='Fingerprint Captured' value={farmerData?.fingerprintCaptured ? 'Yes' : 'No'} />
                      </tbody>
                    </table>
                  </CardContent>


                </Card>
              </TabsContent>

              {/* Farms Tab */}
              <TabsContent value='farms'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {farmData?.map((farm: any) => (
                    <Card
                      role='farm-card'
                      key={farm?.id}
                      className='transition-shadow hover:shadow-lg'
                    >
                      <CardContent className='relative p-6'>
                        <div className='absolute right-5 top-5 flex items-start justify-between'>
                          <CardActions row={farm} onEdit={handleEditFarm} onDelete={handleDeleteFarm} />
                        </div>
                        <div className='mb-4 flex items-start justify-between'>
                          <div>
                            <h3 className='text-xl font-semibold'>
                              {farm?.name}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              ID: {farm?.id}
                            </p>
                          </div>
                        </div>
                        <div className='mb-4 grid grid-cols-2 gap-4'>
                          <div className='space-y-1'>
                            <p className='text-sm text-muted-foreground'>Size</p>
                            <p className='font-medium'>{farm?.size} acres</p>
                          </div>

                          <div className='space-y-1'>
                            <p className='text-sm text-muted-foreground'>
                              Number of Trees
                            </p>
                            <p className='font-medium'>{farm?.trees}</p>
                          </div>
                          <div className='space-y-1'>
                            <p className='text-sm text-muted-foreground'>AMCOS</p>
                            <p className='font-medium'>{farm?.amcos.name}</p>
                          </div>
                        </div>
                        <Button
                          variant='outline'
                          size='sm'
                          className='w-full'
                          onClick={() => handleViewMap(farm?.id)}
                        >
                          <MapPin className='mr-2 h-4 w-4' />
                          View Map
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Harvest History Tab */}
              <TabsContent value='harvests'>
                <Card>
                  <CardHeader>
                    <CardTitle>Harvest History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='rounded-lg border'>
                      <div className='grid grid-cols-6 gap-4 bg-secondary/10 p-4 text-sm font-medium'>
                        <div>Receipt Number</div>
                        <div>Quantity</div>
                        <div>Bags</div>
                        <div>Crop</div>
                        <div>Grade</div>
                        <div>Received At</div>
                      </div>
                      {harvestData?.map((harvest: any) => (
                        <div
                          key={harvest.id}
                          className='grid grid-cols-6 gap-4 border-t p-4 hover:bg-secondary/5'
                        >
                          <div className='text-sm'>{harvest.receiptNumber}</div>
                          <div className='text-sm'>{harvest.netWeight}</div>
                          <div className='text-sm'>{harvest.bags?.length ?? 0}</div>
                          <div className='text-sm'>{harvest.crop.name}</div>
                          <div>
                            <Badge variant='outline' className='text-xs'>
                              {harvest.cropGradeName}
                            </Badge>
                          </div>
                          <div className='text-sm font-medium'>
                            {new Date(harvest.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>}
      </Layout.Body>
      {/* Add Farm Modal */}
      {openFarmForm && <AddEditFarms initialData={farmInitialData} farmerId={params.id} farmerUserId={farmerData.user} mode={farmFormMode} handleCancel={() => setOpenFarmForm(false)} />}
      {/* /*Delete Farm Modal */}
      {showDeleteModal && <DeleteDialog farmerId={params.id} id={farmInitialData?.id} name={farmInitialData?.name} onClose={() => setShowDeleteModal(false)} />}
      <MapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        // @ts-ignore
        farm={selectedFarm}
      />
    </Layout>
  )
}

const TableRow = ({ label, value }: { label: string; value: string }) => (
  <tr className='border-t border-muted'>
    <td className='p-3 font-medium w-1/2 text-muted-foreground'>{label}</td>
    <td className='p-3'>{value}</td>
  </tr>
);

export default FarmerDetailsPage
