
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Mail, Phone, HelpCircle, PlayCircle } from "lucide-react";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mock FAQs data
  const faqs = [
    {
      id: "1",
      question: "How do I add a new camera to my account?",
      answer: "To add a new camera, navigate to the 'Cameras' page and click the 'Add Camera' button. Follow the on-screen instructions to provide camera details like name, IP address, and connection URL. Make sure your camera is connected to your network and is compatible with our system.",
      category: "cameras",
    },
    {
      id: "2",
      question: "What types of events can the system detect?",
      answer: "Our system can detect several safety-critical events including falls, fire, smoke, unauthorized individuals, violent behavior, and choking incidents. You can enable or disable specific detection types in your notification settings.",
      category: "detection",
    },
    {
      id: "3",
      question: "How do I register faces for recognition?",
      answer: "Go to the 'Authorized Faces' page, click 'Add Person' to create a new entry, or 'Upload Image' to add photos of an existing person. Our system uses these images to recognize authorized individuals and will alert you if an unregistered person is detected.",
      category: "faces",
    },
    {
      id: "4",
      question: "How do I set up notifications?",
      answer: "Visit the 'Notification Settings' page to configure how you want to receive alerts. You can choose between email, SMS, and WhatsApp notifications, and specify which types of events trigger alerts.",
      category: "notifications",
    },
    {
      id: "5",
      question: "What happens when an alert is triggered?",
      answer: "When our system detects an event, it records a 10-20 second video clip and sends an alert through your configured notification channels. The alert contains details about the type of event, location, and a link to view the video.",
      category: "alerts",
    },
    {
      id: "6",
      question: "How reliable is the detection system?",
      answer: "Our AI detection system has been trained on thousands of examples and continues to improve. However, no system is perfect. Each alert is reviewed by our team before being sent to reduce false positives. You can help improve the system by providing feedback on alerts.",
      category: "detection",
    },
    {
      id: "7",
      question: "Can I upgrade or downgrade my subscription?",
      answer: "Yes, you can change your subscription plan at any time from the 'Billing' page. Changes to your subscription will take effect at the start of the next billing cycle.",
      category: "billing",
    },
    {
      id: "8",
      question: "Is my data secure?",
      answer: "We take data security very seriously. All video streams are encrypted, and we do not store continuous footage - only event clips when alerts are triggered. These clips are stored securely and can only be accessed by authorized users.",
      category: "security",
    },
  ];
  
  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Help & FAQ</h1>
        
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search for help topics..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Explore our comprehensive guides and documentation to get the most out of your safety monitoring system.
              </p>
              <div className="space-y-2">
                <Button variant="link" className="p-0 h-auto text-left justify-start">Getting Started Guide</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Camera Setup Manual</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Detection System Overview</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Notification Configuration</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-primary" />
                Video Tutorials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Visual learner? Watch our step-by-step video guides on how to use every feature of our platform.
              </p>
              <div className="space-y-2">
                <Button variant="link" className="p-0 h-auto text-left justify-start">How to Add a Camera</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Setting Up Face Recognition</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Configuring Alert Preferences</Button>
                <Button variant="link" className="p-0 h-auto text-left justify-start">Understanding Detection Events</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Need personalized help? Our support team is ready to assist you with any questions or issues.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">support@safeguardai.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">+1 (800) 123-4567</span>
                </div>
                <Button className="w-full">Contact Support Team</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to the most common questions about our safety monitoring system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No FAQs found matching your search. Please try different keywords.
                </div>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Help;
