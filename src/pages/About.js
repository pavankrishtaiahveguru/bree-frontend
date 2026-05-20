import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Leaf, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

const VALUES = [
  {
    id: 'value-1',
    icon: Leaf,
    title: "Purity First",
    desc: "We source only the finest Amla from organic farms across India.",
  },
  {
    id: 'value-2',
    icon: Heart,
    title: "Wellness Focused",
    desc: "Every decision we make is guided by what's best for your health.",
  },
  {
    id: 'value-3',
    icon: Users,
    title: "Community Driven",
    desc: "We're building a community of wellness enthusiasts.",
  },
  {
    id: 'value-4',
    icon: Target,
    title: "Science Meets Tradition",
    desc: "Traditional ingredients backed by modern nutrition — for immunity, digestion, and daily well-being.",
  },
];

const TIMELINE = [
  {
    id: 'tl-1',
    year: "2026",
    event:
      "BREE was born in a small kitchen in Hyderabad — a mother's quest to keep her family healthy, naturally.",
  },
  {
    id: 'tl-2',
    year: "Early 2026",
    event:
      "Friends and neighbours fell in love with the homemade Amla shots. Word spread fast.",
  },
  {
    id: 'tl-3',
    year: "Mid 2026",
    event:
      "Launched online with the first cold-pressed wellness shot line — BREE FIRE.",
  },
  {
    id: 'tl-4',
    year: "Today",
    event:
      "Growing one bottle at a time, still made with the same love and care from home.",
  },
];

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6 },
  };

  return (
    <>
      <Helmet>
        <title>About BREE — Our Story & Mission</title>

        <meta
          name="description"
          content="Learn about BREE — India's premium cold-pressed Amla wellness shot. Pure ingredients, no preservatives, born from a passion for natural wellness."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-24 min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
                Our Story
              </span>

              <h1 className="font-outfit text-4xl md:text-5xl tracking-tight leading-tight font-light text-bree-text-primary mt-4 mb-6">
                About BREE
              </h1>

              <p className="text-bree-text-secondary leading-relaxed mb-6">
                BREE is a new startup born out of a mother's kitchen — a passion
                project turned wellness brand. It all started when a homemaker
                in Hyderabad began making fresh Amla shots for her family every
                morning.
              </p>

              <p className="text-bree-text-secondary leading-relaxed mb-6">
                When her children started feeling more energetic, her skin began
                to glow, and friends kept asking for "that magic shot," she knew
                this was something worth sharing with the world.
              </p>

              <p className="text-bree-text-secondary leading-relaxed">
                Today, BREE is still made with the same homemade love and care —
                cold-pressed, no added sugar, no preservatives. Just pure
                wellness, straight from a mother's heart to your daily routine.
                Rise. Sip. Glow.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24 bg-bree-bg">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeInUp}>
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              Our Mission
            </span>

            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-normal text-bree-text-primary mt-4 mb-6">
              Making Wellness Simple
            </h2>

            <p className="text-bree-text-secondary text-lg leading-relaxed">
              What started as a mother's morning ritual for her family has
              become a mission to bring honest, homemade wellness to every
              household. No factories, no shortcuts — just pure, cold-pressed
              goodness made with intention and love.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              What We Stand For
            </span>

            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-normal text-bree-text-primary mt-4">
              Our Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bree-accent/30 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-bree-primary" />
                </div>

                <h3 className="font-outfit text-xl font-semibold text-bree-text-primary mb-2">
                  {value.title}
                </h3>

                <p className="text-bree-text-secondary text-sm">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-bree-bg">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              Our Journey
            </span>

            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-normal text-bree-text-primary mt-4">
              The BREE Story
            </h2>
          </motion.div>

          <div className="space-y-8">
            {TIMELINE.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-6"
              >
                <div className="w-20 flex-shrink-0">
                  <span className="font-outfit text-2xl font-semibold text-bree-primary">
                    {item.year}
                  </span>
                </div>

                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm">
                  <p className="text-bree-text-secondary">{item.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-bree-text-primary">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-outfit text-3xl md:text-4xl tracking-tight leading-tight font-light text-white mb-6">
              Join the BREE Family
            </h2>

            <p className="text-white/70 text-lg mb-8">
              Start your wellness journey with us today.
            </p>

            <Link to="/shop">
              <Button className="bg-bree-primary hover:bg-bree-primary-hover text-white px-10 py-6 rounded-full text-lg font-medium">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default About;
