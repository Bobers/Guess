const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define default questions
const defaultQuestions = [
  { _id: "q_budget_constrained", text: "Is your customer budget-conscious or price-sensitive?", order: 3 },
  { _id: "q_technical_background", text: "Does your customer have a strong technical background?", order: 4 },
  { _id: "q_large_company", text: "Does your customer work at a large company (500+ employees)?", order: 1 },
  { _id: "q_decision_maker", text: "Is your customer the primary decision-maker for purchases?", order: 2 },
  { _id: "q_technology_industry", text: "Does your customer work in the technology industry?", order: 5 },
  { _id: "q_growth_stage", text: "Is your customer at a company focused on rapid growth?", order: 6 },
  { _id: "q_marketing_role", text: "Is your customer primarily focused on marketing functions?", order: 7 },
  { _id: "q_need_compliance", text: "Does your customer work in a heavily regulated industry?", order: 8 },
  { _id: "q_small_team", text: "Does your customer work with a small team (fewer than 10 people)?", order: 9 },
  { _id: "q_data_driven", text: "Is your customer particularly focused on data-driven decision making?", order: 10 }
];

const profiles = [];
let questions = [...defaultQuestions];

async function createProfile() {
  const profile = {
    answers: {}
  };
  
  console.log('\n=== Creating New Profile ===\n');
  
  // Get basic profile information
  profile._id = await ask('Enter profile ID (e.g., saas_startup_cto): ');
  profile.name = await ask('Enter profile name: ');
  profile.description = await ask('Enter profile description: ');
  
  // Get attributes
  profile.attributes = {};
  profile.attributes.company_size = await ask('Company size (small/medium/large): ');
  profile.attributes.industry = await ask('Industry: ');
  profile.attributes.technical_background = (await ask('Technical background (yes/no): ')) === 'yes';
  
  const additionalAttr = await ask('Add another attribute? (yes/no): ');
  if (additionalAttr === 'yes') {
    const attrName = await ask('Attribute name: ');
    const attrValue = await ask('Attribute value: ');
    profile.attributes[attrName] = attrValue;
  }
  
  // Get recommendations
  profile.marketing_recommendations = [];
  let moreTips = true;
  console.log('\nEnter marketing recommendations (one per line):');
  while (moreTips) {
    const tip = await ask('Enter a marketing tip (or "done" to finish): ');
    if (tip.toLowerCase() === 'done') {
      moreTips = false;
    } else {
      profile.marketing_recommendations.push(tip);
    }
  }
  
  // Get answers to questions
  console.log('\nFor each question, enter the expected answer for this profile:');
  for (const question of questions) {
    console.log(`\nQuestion: ${question.text}`);
    const answer = await ask('Answer (yes/no/unsure): ');
    if (['yes', 'no', 'unsure'].includes(answer.toLowerCase())) {
      profile.answers[question._id] = answer.toLowerCase();
    } else {
      console.log('Invalid answer. Defaulting to "unsure".');
      profile.answers[question._id] = 'unsure';
    }
  }
  
  profiles.push(profile);
  
  const another = await ask('\nCreate another profile? (yes/no): ');
  if (another.toLowerCase() === 'yes') {
    await createProfile();
  }
}

async function createQuestion() {
  console.log('\n=== Creating New Question ===\n');
  
  const question = {};
  
  question._id = await ask('Enter question ID (e.g., q_new_question): ');
  question.text = await ask('Enter question text: ');
  
  const orderStr = await ask('Enter question order (lower numbers asked earlier): ');
  question.order = parseInt(orderStr) || questions.length + 1;
  
  questions.push(question);
  
  // For each profile, get the expected answer to this question
  console.log('\nFor each profile, what is the expected answer to this question?');
  for (const profile of profiles) {
    console.log(`\nProfile: ${profile.name}`);
    const answer = await ask('Answer (yes/no/unsure): ');
    if (['yes', 'no', 'unsure'].includes(answer.toLowerCase())) {
      profile.answers[question._id] = answer.toLowerCase();
    } else {
      console.log('Invalid answer. Defaulting to "unsure".');
      profile.answers[question._id] = 'unsure';
    }
  }
  
  const another = await ask('\nCreate another question? (yes/no): ');
  if (another.toLowerCase() === 'yes') {
    await createQuestion();
  }
}

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function checkOutputDir() {
  const dataDir = path.join(process.cwd(), 'data');
  
  if (!fs.existsSync(dataDir)) {
    console.log('Creating data directory...');
    fs.mkdirSync(dataDir);
  }
}

async function run() {
  console.log('Welcome to the guessright MVP Data Generator\n');
  console.log('This script will help you create the initial profiles and questions for your guessright MVP.');
  
  // Check if data directory exists
  await checkOutputDir();
  
  console.log('\nDefault questions have been loaded.');
  const customQuestions = await ask('Do you want to add custom questions? (yes/no): ');
  
  if (customQuestions.toLowerCase() === 'yes') {
    await createQuestion();
  }
  
  await createProfile();
  
  // Save questions
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'questions.json'), 
    JSON.stringify(questions, null, 2)
  );
  console.log('\nQuestions saved to data/questions.json');
  
  // Save profiles
  fs.writeFileSync(
    path.join(process.cwd(), 'data', 'profiles.json'),
    JSON.stringify(profiles, null, 2)
  );
  console.log('Profiles saved to data/profiles.json');
  
  console.log('\nData generation complete! You can now run "npm run seed" to load this data into MongoDB.');
  
  rl.close();
}

run().catch(console.error);