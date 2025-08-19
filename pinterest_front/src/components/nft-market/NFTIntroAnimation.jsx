import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './nft-intro-animation.css';

const NFTIntroAnimation = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  const steps = [
    {
      id: 0,
      duration: 2500,
      element: (
        <motion.div
          key="step-0"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <motion.div
              className="w-40 h-40 border-2 border-purple-400/20 rounded-full flex items-center justify-center relative"
              animate={{ 
                rotate: 360,
                boxShadow: [
                  "0 0 0 rgba(168, 85, 247, 0.1)",
                  "0 0 60px rgba(168, 85, 247, 0.3)",
                  "0 0 0 rgba(168, 85, 247, 0.1)"
                ]
              }}
              transition={{ 
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div
                className="w-32 h-32 border border-pink-400/30 rounded-full flex items-center justify-center"
                animate={{ 
                  rotate: -360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <motion.div
                  className="w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </motion.div>

            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-purple-400/60 rounded-full"
                style={{
                  left: `${20 + (i * 60)}%`,
                  top: `${20 + (i * 60)}%`
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [0, -20, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 1,
      duration: 2000,
      element: (
        <motion.div
          key="step-1"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.div
              className="flex space-x-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="relative"
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.7 + i * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <motion.div
                    className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      y: [0, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 w-6 h-6 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full"
                    animate={{ 
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <motion.p
                className="text-lg text-gray-300 font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Створення унікальних активів
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 2,
      duration: 2500,
      element: (
        <motion.div
          key="step-2"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            <motion.div
              className="w-56 h-56 border border-purple-400/30 rounded-3xl relative overflow-hidden"
              animate={{ 
                boxShadow: [
                  "0 0 0 rgba(168, 85, 247, 0.1)",
                  "0 0 60px rgba(168, 85, 247, 0.4)",
                  "0 0 0 rgba(168, 85, 247, 0.1)"
                ],
                rotate: [0, 5, 0, -5, 0]
              }}
              transition={{ 
                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-transparent to-pink-500/15"
                animate={{ 
                  background: [
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, transparent 50%, rgba(236, 72, 153, 0.15) 100%)",
                    "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, transparent 50%, rgba(168, 85, 247, 0.15) 100%)",
                    "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, transparent 50%, rgba(236, 72, 153, 0.15) 100%)"
                  ]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              

              <motion.div
                className="absolute inset-4 border border-pink-400/20 rounded-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
              
              <motion.div
                className="absolute inset-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl"
                animate={{ 
                  rotate: 360
                }}
                transition={{ 
                  duration: 12,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.div>
            

            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"
                style={{
                  left: i % 2 === 0 ? '10%' : '85%',
                  top: i < 2 ? '10%' : '85%'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 2,
                  delay: 1.5 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 3,
      duration: 3000,
      element: (
        <motion.div
          key="step-3"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.div
                className="w-96 h-96 border border-purple-400/10 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <motion.h1
              className="text-7xl md:text-9xl font-bold text-white mb-6 relative z-10"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
            >
              <motion.span
                className="gradient-text-animated"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                NFT
              </motion.span>
            </motion.h1>
            
            <motion.p
              className="text-2xl md:text-3xl text-gray-300 max-w-lg mx-auto font-light relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              Майбутнє цифрового мистецтва
            </motion.p>
            
            <motion.div
              className="mt-8 flex justify-center space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.5 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 4,
      duration: 2500,
      element: (
        <motion.div
          key="step-4"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.div
            className="flex flex-col items-center space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            <motion.div
              className="grid grid-cols-3 gap-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0, rotate: -90 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: 0.8 + i * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <motion.div
                    className="w-20 h-20 border border-purple-400/40 rounded-2xl relative overflow-hidden"
                    animate={{ 
                      boxShadow: [
                        "0 0 0 rgba(168, 85, 247, 0.1)",
                        "0 0 20px rgba(168, 85, 247, 0.3)",
                        "0 0 0 rgba(168, 85, 247, 0.1)"
                      ]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                      animate={{ 
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                    

                    <motion.div
                      className="absolute inset-2 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-lg"
                      animate={{ 
                        rotate: 360
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "linear",
                        delay: i * 0.5
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2 }}
            >
              <motion.p
                className="text-lg text-gray-300 font-light"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                Колекція унікальних активів
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )
    },
    {
      id: 5,
      duration: 3500,
      element: (
        <motion.div
          key="step-5"
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.6 }}
          >

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <motion.div
                className="w-80 h-80 border border-purple-400/5 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.05, 0.15, 0.05]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            <motion.div
              className="w-40 h-40 mx-auto mb-8 relative"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
            >
              <motion.div
                className="absolute inset-0 border-2 border-purple-400/50 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.8, 0.3],
                  rotate: 360
                }}
                transition={{ 
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 8, repeat: Infinity, ease: "linear" }
                }}
              />
              <motion.div
                className="absolute inset-6 border-2 border-pink-400/50 rounded-full"
                animate={{ 
                  scale: [1, 0.7, 1],
                  opacity: [0.3, 0.8, 0.3],
                  rotate: -360
                }}
                transition={{ 
                  scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" }
                }}
              />
              <motion.div
                className="absolute inset-12 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              />
            </motion.div>
            
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <motion.span
                className="gradient-text-animated"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Ласкаво просимо
              </motion.span>
            </motion.h2>
            
            <motion.p
              className="text-xl text-gray-300 max-w-md mx-auto font-light relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.5 }}
            >
              Готові відкрити світ унікальних цифрових активів?
            </motion.p>
            
            <motion.div
              className="mt-8 flex justify-center space-x-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  animate={{ 
                    scale: [1, 1.8, 1],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {

        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete();
          }, 800);
        }, 1000);
      }
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep, steps, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >

          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20"
            animate={{ 
              background: [
                "linear-gradient(135deg, #111827 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
                "linear-gradient(135deg, #111827 0%, rgba(236, 72, 153, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)",
                "linear-gradient(135deg, #111827 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)"
              ]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"
            animate={{ 
              x: [0, 30, 0],
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-40 right-32 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl"
            animate={{ 
              x: [0, -25, 0],
              y: [0, 15, 0],
              scale: [1, 0.8, 1]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          <motion.div
            className="absolute bottom-32 left-32 w-40 h-40 bg-blue-500/3 rounded-full blur-3xl"
            animate={{ 
              x: [0, 20, 0],
              y: [0, -30, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />


          <motion.div
            className="absolute top-8 left-1/2 transform -translate-x-1/2 w-64 h-1 bg-gray-800 rounded-full overflow-hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>


          <AnimatePresence mode="wait">
            {steps[currentStep].element}
          </AnimatePresence>

          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                    : 'bg-gray-600'
                }`}
                animate={index === currentStep ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NFTIntroAnimation;
