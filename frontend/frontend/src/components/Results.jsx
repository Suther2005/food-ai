const Results = ({ result }) => (
  <div>
    <h3>Food: {result.food}</h3>
    <h3>Weight: {result.weight}g</h3>
    <h3>Recipe:</h3>
    <p>{result.recipe}</p>
  </div>
);

export default Results;
