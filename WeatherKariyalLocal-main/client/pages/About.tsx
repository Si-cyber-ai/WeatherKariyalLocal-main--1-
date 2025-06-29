import Layout from "@/components/Layout";
import { School, Users, Target, Award } from "lucide-react";
import GlobeKariyad from "@/components/GlobeKariyad";
import SchoolGallery from "@/components/SchoolGallery"

export default function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            About Climate Kariyad
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A school-led weather logging initiative at Kariyad Nambiar Higher
            Secondary School in Kerala, promoting climate literacy and
            data-driven thinking.
          </p>
        </div>

        {/* Project Story */}
        <div className="bg-white rounded-lg border border-border p-8 mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Climate Kariyad is more than just a weather station – it's an
            educational initiative that empowers students and faculty to engage
            with environmental science through hands-on data collection and
            analysis. By manually tracking rainfall, temperature, and humidity,
            our school community develops a deeper understanding of local
            climate patterns and their broader environmental significance.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <School className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Education</h3>
              <p className="text-sm text-muted-foreground">
                Integrating climate science into daily learning
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Students and faculty working together
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Purpose</h3>
              <p className="text-sm text-muted-foreground">
                Building climate awareness and scientific thinking
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Impact</h3>
              <p className="text-sm text-muted-foreground">
                Contributing to local climate data collection
              </p>
            </div>
          </div>
        </div>

        {/* School Information */}
        <div className="bg-accent rounded-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold text-accent-foreground mb-4">
                Kariyad Nambiar Higher Secondary School
              </h2>
              <div className="space-y-3 text-accent-foreground/80">
                <p>
                  <strong>Location:</strong> Kariyad, Kerala, India
                </p>
                <p>
                  <strong>School Code:</strong> 42017
                </p>
                <p>
                  <strong>Established:</strong> 1965
                </p>
                <p>
                  <strong>Type:</strong> Government Higher Secondary School
                </p>
              </div>
            </div>
            <div className="bg-white/50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-accent-foreground mb-4 text-center">
              School Gallery
              </h3>
              <SchoolGallery />
            </div>
          </div>
        </div>

        {/* Interactive Globe Section */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-4">Where We Are</h2>
            <p className="text-center text-muted-foreground mb-6">
              KHSS Kariyad is marked on the interactive globe below.
              </p>
              <GlobeKariyad />
          </section>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Get in Touch
          </h3>
          <p className="text-muted-foreground mb-4">
            Interested in learning more about our climate monitoring initiative?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@kariyad.edu.in"
              className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors"
            >
              Email Us
            </a>
            <a
              href="tel:+91XXXXXXXXXX"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Call School
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
