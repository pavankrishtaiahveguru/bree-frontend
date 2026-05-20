import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Leaf } from 'lucide-react';

const NotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found — BREE</title>
        <meta name="description" content="This page doesn't exist. Head back to BREE and discover our pure Amla wellness shots." />
      </Helmet>

      <div className="min-h-screen bg-bree-bg flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* Animated icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-bree-accent/30 flex items-center justify-center">
                <Leaf className="w-16 h-16 text-bree-primary" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-bree-primary/30"
              />
            </div>
          </motion.div>

          {/* 404 text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary mb-4">
              404 — Not Found
            </p>
            <h1 className="font-outfit text-5xl md:text-6xl font-light text-bree-text-primary mb-4 tracking-tight">
              Lost in the<br />
              <span className="text-bree-primary font-medium">wellness</span> forest
            </h1>
            <p className="text-bree-text-secondary text-lg mb-10 leading-relaxed">
              This page seems to have wandered off. Let's get you back to your daily ritual.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-4 bg-bree-primary text-white rounded-full font-medium hover:bg-bree-primary-hover transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 border border-bree-border text-bree-text-primary rounded-full font-medium hover:bg-bree-accent/20 transition-colors"
            >
              Shop BREE
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
