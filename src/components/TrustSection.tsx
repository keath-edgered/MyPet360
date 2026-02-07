import { Shield, Heart, Clock, Award, Calendar, CalendarClock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Clinics",
    description: "All vets are licensed and registered with Australian veterinary boards",
  },
  {
    icon: Heart,
    title: "Compassionate Care",
    description: "Find clinics known for their gentle approach with anxious pets",
  },
  {
    icon: CalendarClock,
    title: "Schedule Bookings",
    description: "Quickly locate and book appointments with veterinary clinics.",
  },
  {
    icon: Award,
    title: "Real Reviews",
    description: "Read genuine feedback from pet owners in your community",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            Why pet owners trust us
          </h2>
          <p className="mt-3 text-muted-foreground">
            We make finding the right vet simple, transparent, and stress-free
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
