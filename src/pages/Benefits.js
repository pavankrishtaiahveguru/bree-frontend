import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Droplets, Sun, Heart, Brain, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MAIN_BENEFITS = [
  {
    id: 'main-benefit-1',
    icon: Sparkles,
    title: "Rich in Vitamin C",
    subtitle: "20x more than oranges",
    description: "Amla is one of the richest natural sources of Vitamin C, essential for collagen production, immune function, and antioxidant protection.",
    stats: "1000mg per serving"
  },
  {
    id: 'main-benefit-2',
    icon: Shield,
    title: "Immunity Booster",
    subtitle: "Natural defense system",
    description: "The powerful antioxidants in Amla help strengthen your immune system, protecting your body against infections and diseases.",
    stats: "3x stronger immunity"
  },
  {
    id: 'main-benefit-3',
    icon: Droplets,
    title: "Detox & Cleanse",
    subtitle: "Purify from within",
    description: "Amla aids in flushing out toxins from your body, supporting liver function and promoting overall digestive health.",
    stats: "Natural detoxification"
  },
  {
    id: 'main-benefit-4',
    icon: Sun,
    title: "Glowing Skin",
    subtitle: "Radiate natural beauty",
    description: "Regular consumption of Amla promotes healthy, glowing skin by boosting collagen synthesis and fighting free radicals.",
    stats: "Visible results in 30 days"
  }
];

const ADDITIONAL_BENEFITS = [
  { id: 'add-1', icon: Heart, title: "Heart Health", desc: "Supports cardiovascular function" },
  { id: 'add-2', icon: Brain, title: "Brain Function", desc: "Enhances cognitive performance" },
  { id: 'add-3', icon: Zap, title: "Energy Boost", desc: "Natural sustained energy" },
  { id: 'add-4', icon: Eye, title: "Eye Health", desc: "Supports visual acuity" }
];

const NUTRITION_FACTS = [
  { name: "Calories", amount: "19-22 kcal", daily: "-" },
  { name: "Carbohydrates", amount: "4.6-5.0 g", daily: "~2%" },
  { name: "Fiber", amount: "2.1-2.2 g", daily: "~8%" },
  { name: "Protein", amount: "0.1-0.4 g", daily: "-" },
  { name: "Fat", amount: "0.0-0.3 g", daily: "-" },
  { name: "Sugar", amount: "0 g (unsweetened)", daily: "-" },
  { name: "Vitamin C", amount: "215-350 mg", daily: ">100%" },
  { name: "Calcium", amount: "6-12 mg", daily: "~1%" },
  { name: "Potassium", amount: "75-100 mg", daily: "~2%" }
];

const Benefits = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 }
  };

  return (
    <>
      <Helmet>
        <title>Benefits of Amla — Why BREE Works</title>
        <meta name="description" content="Discover the powerful health benefits of Amla. BREE delivers 20x more Vitamin C than oranges, boosts immunity, detoxifies and promotes glowing skin." />
      </Helmet>
    <div className="pt-24 min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              The Science of Wellness
            </span>
            <h1 className="font-outfit text-4xl md:text-5xl tracking-tight leading-tight font-light text-bree-text-primary mt-4 mb-6">
              The Power of Amla
            </h1>
            <p className="text-bree-text-secondary text-lg leading-relaxed">
              Discover why the Indian gooseberry has been revered for thousands of years 
              in Ayurvedic medicine, and how BREE brings its benefits to your daily routine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Benefits */}
      <section className="py-16 md:py-24 bg-bree-bg">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="space-y-16">
            {MAIN_BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-16 h-16 mb-6 rounded-2xl bg-bree-accent/30 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-bree-primary" />
                  </div>
                  <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
                    {benefit.subtitle}
                  </span>
                  <h2 className="font-outfit text-3xl md:text-4xl tracking-tight font-normal text-bree-text-primary mt-2 mb-4">
                    {benefit.title}
                  </h2>
                  <p className="text-bree-text-secondary leading-relaxed mb-6">
                    {benefit.description}
                  </p>
                  <div className="inline-block bg-white px-6 py-3 rounded-full">
                    <span className="font-outfit font-semibold text-bree-primary">
                      {benefit.stats}
                    </span>
                  </div>
                </div>
                <div className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-bree-accent/30 to-transparent rounded-3xl" />
                  <div className="bg-white p-12 rounded-3xl shadow-sm flex items-center justify-center h-[300px]">
                    <benefit.icon className="w-32 h-32 text-bree-accent" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Benefits */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              And More
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-normal text-bree-text-primary mt-4">
              Additional Benefits
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ADDITIONAL_BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.id || benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-bree-bg p-6 rounded-2xl text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-bree-accent/30 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-bree-primary" />
                </div>
                <h3 className="font-outfit font-semibold text-bree-text-primary mb-1">
                  {benefit.title}
                </h3>
                <p className="text-bree-text-secondary text-sm">{benefit.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nutrition Facts */}
      <section className="py-16 md:py-24 bg-bree-bg">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              What's Inside
            </span>
            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-normal text-bree-text-primary mt-4">
              Nutrition Facts
            </h2>
            <p className="text-bree-text-secondary mt-4">Per 50ml serving</p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            className="bg-white rounded-3xl p-8 shadow-sm"
          >
            <div className="border-b-2 border-bree-text-primary pb-4 mb-4">
              <h3 className="font-outfit text-2xl font-semibold text-bree-text-primary">
                BREE Amla Shot
              </h3>
              <p className="text-bree-text-secondary text-sm">Serving Size: 50ml</p>
            </div>
            <div className="space-y-4">
              {NUTRITION_FACTS.map((item) => (
                <div key={item.name} className="flex justify-between items-center py-2 border-b border-bree-border">
                  <span className="font-medium text-bree-text-primary">{item.name}</span>
                  <div className="text-right">
                    <span className="text-bree-text-primary font-semibold">{item.amount}</span>
                    {item.daily !== "-" && (
                      <span className="text-bree-text-secondary text-sm ml-2">({item.daily} DV)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-bree-text-secondary text-xs mt-4">
              *Percent Daily Values are based on a 2,000 calorie diet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-bree-text-primary">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-light text-white mb-6">
              Experience the Benefits Today
            </h2>
            <p className="text-white/70 text-lg mb-8">
              Start your daily Amla ritual and feel the difference.
            </p>
            <Link to="/shop">
              <Button 
                className="bg-bree-primary hover:bg-bree-primary-hover text-white px-10 py-6 rounded-full text-lg font-medium"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
    </>
  );
};

export default Benefits;