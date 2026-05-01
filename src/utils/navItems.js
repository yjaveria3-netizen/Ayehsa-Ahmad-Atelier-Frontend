// ============================================================
// LIBASTRACK NAVIGATION ITEMS
// Using Lucide React icons for consistency
// ============================================================

import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  FolderOpen,
  DollarSign,
  Truck,
  RotateCcw,
  CheckSquare,
  CloudUpload,
  Settings,
  Plus,
  CreditCard,
} from 'lucide-react';

// Flat list of all nav destinations (used by CommandPalette)
export const NAV_ITEMS = [
  { 
    label: 'Dashboard', 
    to: '/dashboard', 
    icon: <LayoutDashboard size={20} />, 
    section: 'Overview' 
  },
  { 
    label: 'Orders', 
    to: '/orders', 
    icon: <ShoppingBag size={20} />, 
    section: 'Commerce' 
  },
  { 
    label: 'Products', 
    to: '/products', 
    icon: <Package size={20} />, 
    section: 'Commerce' 
  },
  { 
    label: 'Customers', 
    to: '/customers', 
    icon: <Users size={20} />, 
    section: 'Commerce' 
  },
  { 
    label: 'Collections', 
    to: '/collections', 
    icon: <FolderOpen size={20} />, 
    section: 'Commerce' 
  },
  { 
    label: 'Financial', 
    to: '/financial', 
    icon: <DollarSign size={20} />, 
    section: 'Operations' 
  },
  { 
    label: 'Suppliers', 
    to: '/suppliers', 
    icon: <Truck size={20} />, 
    section: 'Operations' 
  },
  { 
    label: 'Returns', 
    to: '/returns', 
    icon: <RotateCcw size={20} />, 
    section: 'Operations' 
  },
  { 
    label: 'Checklist', 
    to: '/checklist', 
    icon: <CheckSquare size={20} />, 
    section: 'Planning' 
  },
  { 
    label: 'Drive & Sync', 
    to: '/drive-setup', 
    icon: <CloudUpload size={20} />, 
    section: 'Setup' 
  },
  { 
    label: 'Settings', 
    to: '/brand-settings', 
    icon: <Settings size={20} />, 
    section: 'Setup' 
  },
];

// Grouped structure for the sidebar (used by Layout.js)
export const NAV_GROUPS = [
  { section: 'Overview', items: [NAV_ITEMS[0]] },
  { section: 'Commerce', items: NAV_ITEMS.slice(1, 5) },
  { section: 'Operations', items: NAV_ITEMS.slice(5, 8) },
  { section: 'Planning', items: [NAV_ITEMS[8]] },
  { section: 'Setup', items: NAV_ITEMS.slice(9) },
];

// Quick actions for Dashboard and CommandPalette
export const QUICK_ACTIONS = [
  { 
    label: 'New Order', 
    desc: 'Record a sale', 
    icon: <ShoppingBag size={18} />, 
    IconComponent: ShoppingBag,
    gradient: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
    to: '/orders',
    action: 'add'
  },
  { 
    label: 'Add Product', 
    desc: 'Add to inventory', 
    icon: <Package size={18} />, 
    IconComponent: Package,
    gradient: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-deep) 100%)',
    to: '/products',
    action: 'add'
  },
  { 
    label: 'Add Customer', 
    desc: 'Register a buyer', 
    icon: <Users size={18} />, 
    IconComponent: Users,
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    to: '/customers',
    action: 'add'
  },
  { 
    label: 'Add Supplier', 
    desc: 'New supply contact', 
    icon: <Truck size={18} />, 
    IconComponent: Truck,
    gradient: 'linear-gradient(135deg, var(--gold) 0%, #d97706 100%)',
    to: '/suppliers',
    action: 'add'
  },
  { 
    label: 'New Collection', 
    desc: 'Start a collection', 
    icon: <FolderOpen size={18} />, 
    IconComponent: FolderOpen,
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    to: '/collections',
    action: 'add'
  },
  { 
    label: 'Record Payment', 
    desc: 'Log a transaction', 
    icon: <CreditCard size={18} />, 
    IconComponent: CreditCard,
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
    to: '/financial',
    action: 'add'
  },
];

// Mobile bottom navigation (5 main items)
export const MOBILE_NAV_ITEMS = [
  { 
    label: 'Home', 
    to: '/dashboard', 
    icon: <LayoutDashboard size={22} /> 
  },
  { 
    label: 'Orders', 
    to: '/orders', 
    icon: <ShoppingBag size={22} /> 
  },
  { 
    label: 'Products', 
    to: '/products', 
    icon: <Package size={22} /> 
  },
  { 
    label: 'Customers', 
    to: '/customers', 
    icon: <Users size={22} /> 
  },
  { 
    label: 'Settings', 
    to: '/brand-settings', 
    icon: <Settings size={22} /> 
  },
];
