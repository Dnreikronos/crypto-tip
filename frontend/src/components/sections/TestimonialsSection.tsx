'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Daniel Wilson",
      role: "Indie Game Developer",
      avatar: "/images/avatar-1.jpg",
      text: "CryptoTip has been a game-changer for my open-source work. I've received enough funding to work on my projects full-time, and the direct wallet transfers mean I keep everything my supporters send.",
      stars: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Blockchain Engineer",
      avatar: "/images/avatar-2.jpg",
      text: "The ease of setting up my profile and embedding my donation link on GitHub made a huge difference. Now I receive regular support from users who appreciate my libraries.",
      stars: 5
    },
    {
      name: "Jason Thompson",
      role: "Front-end Developer",
      avatar: "/images/avatar-3.jpg",
      text: "As someone who maintains several popular npm packages, CryptoTip has allowed me to monetize my work without putting it behind paywalls. The community support has been amazing.",
      stars: 4
    }
  ];

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay) return;
    
    const interval = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoplay, testimonials.length]);

  const handleNext = () => {
    setAutoplay(false);
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setAutoplay(false);
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Developers Love CryptoTip
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Hear from developers who have transformed their open-source funding with our platform.
          </p>
        </motion.div>

        <div className="relative">
          <div className="relative h-96 md:h-80 overflow-hidden">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0 flex items-center justify-center px-4"
              >
                <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl border border-gray-700/50 shadow-xl max-w-3xl">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white">
                        {testimonials[current].name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {[...Array(testimonials[current].stars)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                        {[...Array(5 - testimonials[current].stars)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-gray-500" />
                        ))}
                      </div>
                      <p className="text-lg md:text-xl text-gray-200 mb-6 italic">&quot;{testimonials[current].text}&quot;</p>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{testimonials[current].name}</h4>
                        <p className="text-cyan-400">{testimonials[current].role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <button 
              onClick={handlePrev}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all duration-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setAutoplay(false);
                  setDirection(index > current ? 1 : -1);
                  setCurrent(index);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current ? 'bg-cyan-500 scale-125' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
            <button 
              onClick={handleNext}
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white transition-all duration-200"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}