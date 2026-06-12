'use client';

import React from 'react';

export interface ShopBrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  goldColor?: string;
  logoUrl?: string;
}

const DEFAULTS: Required<ShopBrandingConfig> = {
  primaryColor: '#00373E',
  secondaryColor: '#481719',
  accentColor: '#735B4D',
  goldColor: '#D4AF37',
  logoUrl: '',
};

export function resolveShopBranding(raw?: unknown): ShopBrandingConfig {
  if (!raw || typeof raw !== 'object') return DEFAULTS;
  const b = raw as ShopBrandingConfig;
  return { ...DEFAULTS, ...b };
}

export function ShopBrandingScope({
  branding,
  children,
  className = '',
}: {
  branding?: unknown;
  children: React.ReactNode;
  className?: string;
}) {
  const b = resolveShopBranding(branding);
  const style = {
    '--shop-primary': b.primaryColor,
    '--shop-secondary': b.secondaryColor,
    '--shop-accent': b.accentColor,
    '--shop-gold': b.goldColor,
  } as React.CSSProperties;

  return (
    <div className={`shop-branded ${className}`} style={style}>
      {children}
    </div>
  );
}
