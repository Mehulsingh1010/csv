'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Papa from 'papaparse';

export default function Home() {
  const [csvData, setCsvData] = useState<object[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      Papa.parse(file, {
        complete: (result) => {
          setCsvData(result.data as object[]);
          setIsLoading(false);
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (csvData.length === 0) {
      setAnswer("Please upload a CSV file first.");
      return;
    }

    setIsLoading(true);

    try {
      // Send a subset of CSV data to avoid payload issues
      const dataToSend = csvData.slice(0, 100); // Adjust row limit as needed
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, csvData: dataToSend }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error querying data:', error);
      setAnswer('Sorry, there was an error processing your query.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dynamic CSV Analyzer</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="file" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="mb-4"
          />
          {isLoading && <p>Loading...</p>}
        </CardContent>
      </Card>

      {csvData.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>CSV Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr>
                    {Object.keys(csvData[0]).map((key) => (
                      <th key={key} className="px-4 py-2 bg-gray-100">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i} className="border px-4 py-2">{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about the CSV data"
              className="w-full"
            />
            <Button type="submit" disabled={isLoading || csvData.length === 0}>
              {isLoading ? 'Processing...' : 'Submit'}
            </Button>
          </form>
          {answer && (
            <div className="mt-4">
              <h3 className="font-bold">Answer:</h3>
              <p>{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
