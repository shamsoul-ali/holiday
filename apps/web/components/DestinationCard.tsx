'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Star, TrendingUp } from 'lucide-react';

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  rating: number;
  reviews: number;
  price: string;
  trending?: boolean;
  delay?: number;
}

export default function DestinationCard({
  name,
  country,
  image,
  rating,
  reviews,
  price,
  trending = false,
  delay = 0
}: DestinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Trending Badge */}
        {trending && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-4 h-4" />
            Trending
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
          <div className="text-xs text-gray-600 mb-1">Starting from</div>
          <div className="text-xl font-bold text-blue-600">{price}</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{country}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">{reviews.toLocaleString()} reviews</span>

          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
            View Deals
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500 rounded-2xl transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}
