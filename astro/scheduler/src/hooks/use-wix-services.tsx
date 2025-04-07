import { useState, useEffect } from "react";
import { useWixClient } from "./use-wix-client";
import { useToast } from "./use-toast";

interface ServiceOption {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  duration?: number;
  type: "free" | "premium";
}

interface UseWixServicesResult {
  services: ServiceOption[];
  loading: boolean;
  error: string | null;
  getServiceById: (id: string) => ServiceOption | undefined;
  getServiceByType: (type: "free" | "premium") => ServiceOption | undefined;
}

export const useWixServices = (): UseWixServicesResult => {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wixClient = useWixClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { items } = await wixClient.services.queryServices().find();
        
        const mappedServices = items.map((service: any) => ({
          _id: service._id,
          name: service.name,
          description: service.description || "",
          price: service.variants?.[0]?.prices?.price || 0,
          duration: service.variants?.[0]?.duration || 0,
          type: service.name.toLowerCase().includes("free") ? "free" : "premium"
        }));
        
        setServices(mappedServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Failed to load services");
        toast({
          title: "Error",
          description: "Failed to load services. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [wixClient]);

  const getServiceById = (id: string): ServiceOption | undefined => {
    return services.find(service => service._id === id);
  };

  const getServiceByType = (type: "free" | "premium"): ServiceOption | undefined => {
    return services.find(service => service.type === type);
  };

  return { services, loading, error, getServiceById, getServiceByType };
};