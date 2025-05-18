import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BadgeCheck,
  Calendar,
  CreditCard,
  Download,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
  downloadUrl: string;
}

const Billing = () => {
  // Mock data for billing page
  const subscriptionData = {
    plan: "Premium",
    status: "active",
    nextBilling: "June 15, 2025",
    amount: "$29.99",
    cameras: 5,
    maxCameras: 10,
  };

  const paymentMethod = {
    cardType: "Visa",
    lastFour: "4242",
    expiryDate: "04/26",
    cardholderName: "John Doe",
  };

  const invoices: Invoice[] = [
    {
      id: "INV-2025-001",
      date: "May 18, 2025",
      amount: "$29.99",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2025-000",
      date: "April 18, 2025",
      amount: "$29.99",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-012",
      date: "March 18, 2025",
      amount: "$29.99",
      status: "paid",
      downloadUrl: "#",
    },
    {
      id: "INV-2024-011",
      date: "February 18, 2025",
      amount: "$29.99",
      status: "paid",
      downloadUrl: "#",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Current Subscription</CardTitle>
              <CardDescription>Your current plan and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">
                      {subscriptionData.plan} Plan
                    </h3>
                    <Badge
                      variant="outline"
                      className="bg-primary/10 text-primary"
                    >
                      {subscriptionData.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next billing on {subscriptionData.nextBilling}
                  </p>
                </div>
                <div className="text-2xl font-bold">
                  {subscriptionData.amount}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Camera Usage</span>
                  <span>
                    {subscriptionData.cameras} of {subscriptionData.maxCameras}{" "}
                    cameras
                  </span>
                </div>
                <Progress
                  value={
                    (subscriptionData.cameras / subscriptionData.maxCameras) *
                    100
                  }
                  className="h-2"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Multi-camera support</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">AI-powered detection alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">
                    Email, SMS and WhatsApp notifications
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Face recognition</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <span className="text-sm">24/7 monitoring</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="destructive">Cancel Subscription</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <div className="p-2 bg-primary/10 rounded-md">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-medium">
                    {paymentMethod.cardType} ending in {paymentMethod.lastFour}
                  </h3>
                  <div className="flex text-sm text-muted-foreground">
                    <p>Expires {paymentMethod.expiryDate}</p>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Billing History</CardTitle>
            <CardDescription>View and download your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-xs uppercase">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          Invoice
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="px-6 py-4 font-medium">
                            {invoice.id}
                          </td>
                          <td className="px-6 py-4">{invoice.date}</td>
                          <td className="px-6 py-4">{invoice.amount}</td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : ""
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={invoice.downloadUrl}>
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
