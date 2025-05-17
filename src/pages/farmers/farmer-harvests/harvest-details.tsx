import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/custom/button';
import { MapPin, Calendar, Phone, Mail, Home, Crop, CropIcon, Eye } from 'lucide-react';
import { Layout } from '@/components/custom/layout';
import ThemeSwitch from '@/components/theme-switch';
import { UserNav } from '@/components/user-nav';
import { Search } from '@/components/search';
import { Badge } from '@/components/ui/badge';
import { Package, Scale, Tag } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { retrieveFarmerHarvest } from '@/helpers/api-helper';
import { snakeToCamelCase } from "@/lib/utils";

// Type definitions
interface Bag {
  tagNumber: number;
  grossWeight: string;
  netWeight: string;
  packagingWeight: string;
  moistureContent: string;
}

interface HarvestData {
  id: number;
  farmer: number;
  farmerName: string;
  farmerPhoneNumber: string;
  grossWeight: string;
  netWeight: string;
  packagingWeight: string;
  moistureContent: string;
  bagsData: any;
  uom: string;
  packaging: string;
  receiptNumber: string;
  amcos: number;
  amcosName: string;
  registar: number;
  registarName: string;
  crop: number;
  cropName: string;
  cropGrade: number;
  cropGradeName: string;
  collectionCenter: number;
  collectionCenterName: string;
  receivedAt: string;
}

interface HarvestDetailsTableProps {
  harvestData: HarvestData;
}

const HarvestDetailsTable: React.FC<HarvestDetailsTableProps> = ({ harvestData }) => {


  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Harvest Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Receipt Number:</span> {harvestData?.receiptNumber}</p>
              <p className="text-sm"><span className="font-medium">AMCOS:</span> {harvestData?.amcosName}</p>
              <p className="text-sm"><span className="font-medium">Collection Center:</span> {harvestData?.collectionCenterName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-medium">Crop:</span> {harvestData?.cropName}</p>
              <p className="text-sm"><span className="font-medium">Grade:</span> {harvestData?.cropGradeName}</p>
              <p className="text-sm"><span className="font-medium">Received:</span> {new Date(harvestData?.receivedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Bags Table */}
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/5">
                  <th className="p-3 text-left">Bag Number</th>
                  <th className="p-3 text-left">Weight({harvestData?.grossWeight})</th>
                  <th className="p-3 text-left">Grade ({harvestData?.netWeight})</th>
                </tr>
              </thead>
              <tbody>
                {harvestData.bagsData.bags.map((bag: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{bag.bagNumber}</td>
                    <td className="p-3">{bag.weight}</td>
                    <td className="p-3">{bag.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FarmerDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: harvestData,
    isLoading: loadingFarmer,
  } = useQuery<HarvestData>({
    queryKey: ['farmer-harvest-details', params?.id],
    queryFn: async () => {
      const response: any = await retrieveFarmerHarvest(`${params?.id}`);
      return snakeToCamelCase(response);
    },
  });

  return (
    <Layout>
      <Layout.Header sticky>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <UserNav />
        </div>
      </Layout.Header>
      <Layout.Body>
        <div>
          {/* Header Section */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-secondary/20 flex items-center justify-center">
                    <CropIcon />
                  </div>
                </div>

                {/* Farmer Info */}
                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{harvestData?.farmerName}</h1>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-sm">
                          Phone: {harvestData?.farmerPhoneNumber}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4 md:mt-0">

                      <Button variant="default" size="sm"
                        onClick={() => navigate(`/dashboard/farmer-harvests/${harvestData?.farmer}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Farmer
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Gross Weight</p>
                      <p className="text-xl font-semibold">{harvestData?.grossWeight} {harvestData?.uom}</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Net Weight</p>
                      <p className="text-xl font-semibold">{harvestData?.netWeight} {harvestData?.uom}</p>
                    </div>
                    <div className="bg-secondary/10 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Moisture Content</p>
                      <p className="text-xl font-semibold">{harvestData?.moistureContent}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Harvest Details */}
          {harvestData && <HarvestDetailsTable harvestData={harvestData} />}
        </div>
      </Layout.Body>
    </Layout>
  );
};

export default FarmerDetailsPage;