import { motion, type Variants } from "framer-motion";
import { MapPin, Search, Heart, Shield, PawPrint, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const heroPets = "https://img.freepik.com/free-photo/young-lightskinned-brunette-woman-kisses-her-beloved-dog-tightly-while-holding-arms-pink-background-love-pets-joy-tenderness_197531-31334.jpg?t=st=1770445490~exp=1770449090~hmac=5c51dd0064ef1927891bf18561fa5f38610a502c7ddc5d83ccc2f281f492e524";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const features = [
  {
    icon: Search,
    title: "Find Vet Clinics",
    description:
      "Locate trusted veterinary clinics near you with ratings, reviews, and real-time availability.",
  },
  {
    icon: ShoppingBag,
    title: "Pet Food Stores",
    description:
      "Discover the best pet food stores and suppliers in your area with exclusive deals.",
  },
  {
    icon: MapPin,
    title: "Lost Pet Map",
    description:
      "Flag your lost pet on a live map so your community can help bring them home safely.",
  },
  {
    icon: Heart,
    title: "Pet Health Tracker",
    description:
      "Keep track of vaccinations, medications, and vet appointments all in one place.",
  },
  {
    icon: Shield,
    title: "Pet Insurance",
    description:
      "Compare and find the best pet insurance plans to keep your furry friend protected.",
  },
  {
    icon: PawPrint,
    title: "Community",
    description:
      "Connect with other pet owners, share tips, and join local pet events near you.",
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: typeof Search;
  title: string;
  description: string;
  index: number;
}) => (
  <motion.div
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={fadeUp}
    className="group rounded-2xl border border-border bg-card p-6 card-shadow transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1"
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-card-foreground">{title}</h3>
    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
  </motion.div>
);

const stats = [
  { value: "10K+", target: 10000, label: "Happy Pets" },
  { value: "500+", target: 500, label: "Vet Clinics" },
  { value: "1,200+", target: 1200, label: "Stores Listed" },
  { value: "300+", target: 300, label: "Pets Reunited" },
];

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const CountUp = ({ target, duration = 1200 }: { target: number; duration?: number }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState("0");
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();

            const step = (now: number) => {
              const elapsed = now - start;
              const t = Math.min(1, elapsed / duration);
              const v = Math.round(target * easeOutCubic(t));

              if (target >= 10000) {
                // show as K+
                setDisplay(`${Math.round(v / 1000)}K+`);
              } else {
                setDisplay(`${v.toLocaleString()}+`);
              }

              if (t < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref} className="text-4xl font-extrabold text-primary md:text-5xl">
      {display}
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-32">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground">
                <PawPrint className="h-3.5 w-3.5" />
                Everything your pet needs
              </div>
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
                Your Pet's World, <span className="text-primary">All in One Place</span>
              </h1>
              <p className="mb-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
                From finding the nearest vet clinic to flagging a lost pet on a live map — MyPet360 is the all-in-one companion app for every pet parent.
              </p>
              <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
                <button className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-lg">
                  Explore Now
                </button>
                <button className="rounded-full border border-border px-8 py-3 font-semibold text-foreground transition-colors hover:bg-secondary">
                  Learn More
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex flex-1 justify-center"
            >
              <div className="relative h-72 w-72 rounded-3xl md:h-96 md:w-96 overflow-hidden card-shadow">
                <img src={heroPets} alt="Happy dog and cat" className="h-full w-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            About <span className="text-primary">MyPet360</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We believe every pet deserves the best care. MyPet360 connects pet owners with veterinary clinics, pet food stores, community support, and a real-time lost-pet map — all from a single, beautifully designed app. Whether you're a first-time puppy parent or a seasoned cat lover, we've got you covered.
          </p>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-16">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl"
        >
          Everything You Need
        </motion.h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="hero-gradient">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                    <CountUp target={s.target} />
                <div className="mt-2 text-sm font-medium text-muted-foreground">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="rounded-3xl bg-card p-12 card-shadow"
        >
          <h2 className="mb-4 text-3xl font-bold text-card-foreground">
            Ready to give your pet the best?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Join thousands of pet parents who trust MyPet360 every day.
          </p>
         <button onClick={() => window.location.href = './Login'} className="rounded-full bg-accent px-10 py-3.5 font-semibold text-accent-foreground transition-all hover:scale-105 hover:shadow-lg">
            Get Started Free
        </button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
