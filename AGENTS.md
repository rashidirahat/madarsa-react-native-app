# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# AGENTS.md


## RESPONSES

- Keep responses concise and to the point - unless the user ask other wise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium model for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation 
- After completing features (large or small), always run command like lint, type check and next build to check code quality

## Routes

- Always create seperate route for sepearte models


