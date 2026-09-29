const fs = require('fs');

console.log('Reading raw dataset...');
const rawData = fs.readFileSync('temp_dataset/data/exercises.json');
const exercises = JSON.parse(rawData);

console.log('Processing ' + exercises.length + ' exercises...');
const cleanExercises = exercises.map(ex => ({
  id: ex.id,
  name: ex.name,
  category: ex.category,
  bodyPart: ex.body_part,
  equipment: ex.equipment,
  target: ex.target,
  instructions: ex.instruction_steps?.en || [],
  gifUrl: `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/${ex.gif_url}`
}));

fs.writeFileSync('src/data/exercises-library.json', JSON.stringify(cleanExercises));
console.log('Su ccessfully saved optimized dataset to src/data/exercises-library.json!');
