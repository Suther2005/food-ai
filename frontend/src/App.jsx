import { useState } from "react";
import LiveCamera from "./components/LiveCamera";
import Results from "./components/Results";

const App = () => {
  const [result, setResult] = useState(null);

  return (
    <div>
      <h1>Live AI Food Recognition</h1>
      <LiveCamera setResult={setResult} />
      {result && <Results result={result} />}
    </div>
  );
};

export default App;
