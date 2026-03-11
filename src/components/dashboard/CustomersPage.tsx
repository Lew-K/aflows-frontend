import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers } from "@/hooks/useCustomers";

export const CustomersPage = ({ businessId }) => {

  const { customers, loading } = useCustomers(businessId);

  return (

    <div className="space-y-6 p-6">

      <h1 className="text-2xl font-bold">
        Customers
      </h1>

      <Card>

        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>

        <CardContent>

          {loading ? (
            <p>Loading...</p>
          ) : (

            <table className="w-full text-sm">

              <thead className="text-muted-foreground">

                <tr>
                  <th className="text-left">Customer</th>
                  <th>Phone</th>
                  <th>Total Spent</th>
                  <th>Last Purchase</th>
                </tr>

              </thead>

              <tbody>

                {customers.map((c: any) => (

                  <tr key={c.phone} className="border-t">

                    <td>{c.customer_name}</td>

                    <td>{c.customer_phone}</td>

                    <td>KES {c.total_spent.toLocaleString()}</td>

                    <td>
                      {new Date(c.last_purchase).toLocaleDateString()}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </CardContent>

      </Card>

    </div>
  );

};
