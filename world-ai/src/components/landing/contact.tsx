import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";
import { sendContactEmail } from "@/services/api";
import Helpers from "@/config/helpers";
const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await sendContactEmail(formData);
      Helpers.showToast('Message sent successfully!', 'success');
      setFormData({
        name: '',
        subject: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error: any) {
      Helpers.showToast(error.message || 'Error sending message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="py-32 bg-gradient-to-b from-background to-background/50">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-muted-foreground">
            We can provide dedicated instances, unique pricing, model fine tuning or solution customization for your business.
          </p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="w-full p-3 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Subject</label>
              <input
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                type="text"
                className="w-full p-3 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Email Address</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="w-full p-3 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Phone Number</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                className="w-full p-3 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              className="w-full p-3 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="text-center">
            <Button 
              type="submit"
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 px-12"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;