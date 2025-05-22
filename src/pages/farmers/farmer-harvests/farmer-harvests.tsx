import React, { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/custom/button'
import { MapPin, Calendar, Phone, Mail, Home, PlusCircle, BadgeCheck, Fingerprint, IdCard } from 'lucide-react'
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
  getCrops,
  getFarmerHarvests,
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
  x: string
  y: string
}

interface Farm {
  id: number
  name: string
  coordinates: Coordinate[]
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
      (coord) => [parseFloat(coord.x), parseFloat(coord.y)] as [number, number]
    )
  }

  const mapData = convertToLatLngArray(farm.coordinates)

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
  const [handleOpenAddFarm, setHandleOpenAddFarm] = useState(false)
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
      setHandleOpenAddFarm(false)

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

  // Fetch AMCOS
  const { data: farmesrData, isLoading: loadingFarmer } = useQuery({
    queryKey: ['farmer', params?.id],
    queryFn: async () => {
      const response: any = await retrieveFarmer(`${params?.id}`)
      return response.data
    },
  });

  const { data: crops, isLoading: loadingCrops } = useQuery({
    queryKey: ['crops', params?.id],
    queryFn: async () => {
      const response: any = await getCrops()
      const main = response?.find(
        (crop: any) => crop.id === farmesrData?.mainCrop
      )
      const secondary = response?.find(
        (crop: any) => crop.id === farmesrData?.secondaryCrop
      )
      return main?.name + ',' + secondary?.name;
    },
  });

  console.log(crops);
  


  // Fetch AMCOS
  const { data: farmesrFarms, isLoading: loadingFarmerFarms } = useQuery({
    queryKey: ['farmer-farms', params?.id],
    queryFn: async () => {
      const response: any = await retrieveFarmerFarms(`${params?.id}/farms`)
      return response.data
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dta = {
      ...formData,
      farmer: params?.id,
      amcos: farmesrData?.amcos,
    }
    await mutation.mutateAsync(dta)
  }

  const { data: farmerHarvest, isLoading: loadingFarmerHarvest } = useQuery({
    queryKey: ['farmer-harvests', params?.id],
    queryFn: async () => {
      const response: any = await getFarmerHarvests(`${params?.id}`)
      const arr = []
      arr.push(response.data)
      return arr
    },
  })

  const handleViewMap = (farmId: any) => {
    const farm = farmesrFarms.find((f: any) => f.id === farmId)
    console.log(farm)

    // @ts-ignore
    setSelectedFarm(farm)
    setIsMapOpen(true)
  }

 

  const calculateTotalArea = () => {
    if (!farmesrFarms) return 0
    return farmesrFarms?.reduce((total: number, farm: any) => {
      return total + parseFloat(farm?.farmSize || 0)
    }, 0)
  }

  const totalArea = calculateTotalArea()

  const [selectedTab, setSelectedTab] = useState('details')

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
        <div className=' '>
          {/* Header Section */}
          <div className='mb-8'>
            <Card className='p-6'>
              <div className='flex flex-col gap-6 md:flex-row'>
                {/* Profile Picture */}
                <div className='flex-shrink-0'>
                  <div className='flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-secondary/20'>
                    {!farmesrData?.image ? (
                      <div className='flex h-full w-full items-center justify-center bg-primary text-3xl font-bold text-white'>
                        {farmesrData?.firstName[0]}
                        {farmesrData?.lastName[0]}
                      </div>
                    ) : (
                      <img
                        src={farmesrData?.image}
                        alt={farmesrData?.name}
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
                        {farmesrData?.firstName} {farmesrData?.lastName}
                      </h1>
                      <div className='mb-2 flex items-center gap-2'>
                        <Badge variant='outline' className='text-sm'>
                          ID: {farmesrData?.idNumber}
                        </Badge>

                        <Badge
                          variant={
                            farmesrData?.status === 'Active'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {farmesrData?.status}
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
                        onClick={() => setHandleOpenAddFarm(true)}
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
                        {farmesrFarms?.length || 0}
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
                        {farmesrFarms?.length || 0}
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
      <TableRow label='Contact Number' value={farmesrData?.phoneNumber} />
      <TableRow label='TUME Number' value={farmesrData?.tumeNumber || 'N/A'} />
      <TableRow label='TIN Number' value={farmesrData?.tinNumber || 'N/A'} />
      <TableRow label='Main Crop' value={crops?.split(',')[0] || 'N/A'} />
      <TableRow label='Education Level' value={farmesrData?.educationLevel || 'N/A'} />
      <TableRow label='Date of Birth' value={new Date(farmesrData?.dob).toLocaleDateString()} />
      <TableRow label='TTB Number' value={farmesrData?.ttbNumber || 'N/A'} />
      <TableRow label='Secondary Crop' value={crops?.split(',')[1] || 'N/A'} />
      <TableRow label='Gender' value={farmesrData?.sex} />
      <TableRow label='Registration Date' value={new Date(farmesrData?.createdAt).toLocaleDateString()} />
      <TableRow label='ID Type' value={farmesrData?.idType} />
      <TableRow label='Voter ID' value={farmesrData?.voterId || 'N/A'} />
      <TableRow label='Drivers License' value={farmesrData?.driversLicense || 'N/A'} />
      <TableRow label='Fingerprint Captured' value={farmesrData?.fingerprintCaptured ? 'Yes' : 'No'} />
    </tbody>
  </table>
</CardContent>


              </Card>
            </TabsContent>

            {/* Farms Tab */}
            <TabsContent value='farms'>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {farmesrFarms?.map((farm: any) => (
                  <Card
                    key={farm?.id}
                    className='transition-shadow hover:shadow-lg'
                  >
                    <CardContent className='p-6'>
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
                          <p className='font-medium'>{farm?.farmSize} acres</p>
                        </div>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>Crop</p>
                          <p className='font-medium'>{farm?.cropName}</p>
                        </div>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>
                            Number of Trees
                          </p>
                          <p className='font-medium'>{farm?.numberOfTrees}</p>
                        </div>
                        <div className='space-y-1'>
                          <p className='text-sm text-muted-foreground'>AMCOS</p>
                          <p className='font-medium'>{farm?.amcosName}</p>
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
                      <div>UOM</div>
                      <div>Crop</div>
                      <div>Grade</div>
                      <div>Received At</div>
                    </div>
                    {farmerHarvest?.map((harvest: any) => (
                      <div
                        key={harvest.id}
                        className='grid grid-cols-6 gap-4 border-t p-4 hover:bg-secondary/5'
                      >
                        <div className='text-sm'>{harvest.receiptNumber}</div>
                        <div className='text-sm'>{harvest.quantity}</div>
                        <div className='text-sm'>{harvest.uom}</div>
                        <div className='text-sm'>{harvest.cropName}</div>
                        <div>
                          <Badge variant='outline' className='text-xs'>
                            {harvest.cropGradeName}
                          </Badge>
                        </div>
                        <div className='text-sm font-medium'>
                          {new Date(harvest.receivedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Layout.Body>
      <Dialog
        open={handleOpenAddFarm}
        onOpenChange={() => {
          setHandleOpenAddFarm(false)
        }}
      >
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Add New Farm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Farm Name</label>
              <Input
                type='text'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Farm Size (acres)</label>
              <Input
                type='number'
                value={formData.farmSize}
                onChange={(e) =>
                  setFormData({ ...formData, farmSize: e.target.value })
                }
              />
            </div>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Coordinates</label>
              {formData.coordinates.map((coord, index) => (
                <div key={index} className='mt-2 grid grid-cols-2 gap-2'>
                  <Input
                    type='text'
                    placeholder='X coordinate'
                    value={coord.x}
                    onChange={(e) =>
                      updateCoordinate(index, 'x', e.target.value)
                    }
                  />
                  <Input
                    type='text'
                    placeholder='Y coordinate'
                    value={coord.y}
                    onChange={(e) =>
                      updateCoordinate(index, 'y', e.target.value)
                    }
                  />
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='mt-2'
                onClick={() =>
                  setFormData({
                    ...formData,
                    coordinates: [...formData.coordinates, { x: '', y: '' }],
                  })
                }
              >
                Add Coordinate
              </Button>
            </div>
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setHandleOpenAddFarm(false)
                }}
              >
                Cancel
              </Button>
              <Button type='submit' loading={mutation.isPending}>
                Add Farm
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
