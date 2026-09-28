import type { ElementType } from "react";

export interface IDepCard {
  _id: string;
  field: string;
  category: string;
  summary: string;
  availableSpecialist: number;
  icon: ElementType;
  iconBgColor: string;
  iconColor: string;
  onView?: () => void;
}

export interface ViewDeparmentModal {
  _id: string;
  field: string;
  icon: ElementType;
  image?: string;
  overview?: string;
  services?: string[];
}

export interface IDepartment {
  _id: string;
  field: string;
  category: string;
  summary: string;
  availableSpecialist: number;
  icon: string;
  iconBgColor: string;
  iconColor: string;

  details?: {
    overview?: string;
    services?: string[];
    image?: string;
  };

  createdAt?: string;
  updatedAt?: string;
}