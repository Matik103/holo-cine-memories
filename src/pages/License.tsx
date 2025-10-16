import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const License = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="container mx-auto px-4 py-6 max-w-4xl pt-6 sm:pt-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">License Agreement</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">CineMind License</h2>
            <p className="text-muted-foreground">
              This License Agreement ("Agreement") is a legal agreement between you and CineMind 
              for the use of CineMind software and services ("Software").
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Grant of License</h2>
            <p className="text-muted-foreground mb-4">
              CineMind grants you a revocable, non-exclusive, non-transferable, limited license to 
              download, install and use the Software solely for your personal, non-commercial purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Restrictions</h2>
            <p className="text-muted-foreground mb-4">You agree not to, and you will not permit others to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>License, sell, rent, lease, assign, distribute, transmit, host, outsource, disclose or otherwise commercially exploit the Software</li>
              <li>Modify, make derivative works of, disassemble, decrypt, reverse compile or reverse engineer any part of the Software</li>
              <li>Remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of CineMind</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Intellectual Property Rights</h2>
            <p className="text-muted-foreground">
              The Software and all worldwide copyrights, trade secrets, and other intellectual property 
              rights therein are the exclusive property of CineMind. CineMind reserves all rights not 
              expressly granted to you in this Agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Termination</h2>
            <p className="text-muted-foreground">
              This Agreement is effective until terminated. Your rights under this Agreement will 
              terminate automatically without notice if you fail to comply with any term(s) of this Agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about this License Agreement, please contact us at:
            </p>
            <p className="font-medium mt-2">ernst@cinemind.tech</p>
          </section>
        </div>
      </div>
    </div>
  );
};