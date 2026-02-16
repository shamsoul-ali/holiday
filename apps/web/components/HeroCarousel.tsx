'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plane, MapPin } from 'lucide-react';
import Image from 'next/image';

interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  description: string;
  price: string;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1920&q=80',
    description: 'Experience the stunning white-washed buildings and breathtaking sunsets',
    price: 'From RM 3,500'
  },
  {
    id: 2,
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&q=80',
    description: 'Discover tropical paradise with pristine beaches and rich culture',
    price: 'From RM 1,800'
  },
  {
    id: 3,
    name: 'Maldives',
    country: 'Indian Ocean',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80',
    description: 'Luxury overwater villas and crystal-clear turquoise waters',
    price: 'From RM 5,200'
  },
  {
    id: 4,
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
    description: 'Modern metropolis meets ancient temples and traditions',
    price: 'From RM 4,500'
  },
  {
    id: 5,
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1920&q=80',
    description: 'Luxury shopping, ultramodern architecture, and desert adventures',
    price: 'From RM 3,200'
  }
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % destinations.length;
      }
      return prev === 0 ? destinations.length - 1 : prev - 1;
    });
  };

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden rounded-3xl">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);

            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="relative w-full h-full">
            <Image
              src={destinations[currentIndex].image}
              alt={destinations[currentIndex].name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full p-8 md:p-12 lg:p-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-4xl"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-white/80 text-sm md:text-base font-medium">
                    {destinations[currentIndex].country}
                  </span>
                </div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                  {destinations[currentIndex].name}
                </h2>

                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl">
                  {destinations[currentIndex].description}
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl border border-white/20">
                    <span className="text-2xl font-bold text-white">
                      {destinations[currentIndex].price}
                    </span>
                  </div>

                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center gap-2 shadow-xl">
                    <Plane className="w-5 h-5" />
                    Explore Packages
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all z-10 group"
        aria-label="Previous destination"
      >
        <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      <button
        onClick={() => paginate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full transition-all z-10 group"
        aria-label="Next destination"
      >
        <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {destinations.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
