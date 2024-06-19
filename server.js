import express from 'express';
import fetchJson from './helpers/fetch-json.js';
import { AwesomeGraphQLClient } from 'awesome-graphql-client';

const app = express();

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Handle URL-encoded data
app.use(express.urlencoded({ extended: true }));

const client = new AwesomeGraphQLClient({
  endpoint: 'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvw76z7t00aq07uzaijft13n/master',
  fetch,
});

app.get('/', async (request, response) => {
  const teamQuery = `
    { 
      teams {
        name
        slug
        colors {
          css
          hex
        }
      }
    }
  `;

  const employeeQuery = `
    {
      employees {
        name
        age
        role
        avatar {
          url
        }
        team {
          name
        }
        
      }
    }
  `;
  const projectsQuery =  `
  { 
  projects {
    name
    description
    team {
      employees {
        name
      }
    }
  }
}`;
    
  
try {
  const { teams } = await client.request(teamQuery);
  const { employees } = await client.request(employeeQuery);
  const { projects } = await client.request(projectsQuery);

  let filteredEmployees = employees;
  const { search } = request.query;

  if (search) {
    const searchTerm = search.toLowerCase().trim();
    filteredEmployees = employees.filter(employee => {
      return (
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.team.name.toLowerCase().includes(searchTerm)
      );
    });
  }

  response.render('index', { teams, employees: filteredEmployees, projects, searchTerm: search });
} catch (error) {
  console.error('Error fetching data:', error);
  response.status(500).send('Internal Server Error');
}
});

app.get('/team/:slug', async function (req, res) {
  const teamQuery = `
    query TeamsPageQuery($slug: String!) {
      teams(where: { slug: $slug }) {
        name
        slug
        colors {
          css
          hex
        }
        employees {
          name
          age
          role
          cupsOfCoffee
          sickdays
          vacationdays
          avatar {
            url
          }
        }
        
      }
    }
  `;

  const { slug } = req.params;

  try {
    const { teams } = await client.request(teamQuery, { slug });

    if (teams.length > 0) {
      res.render('teams', { teams });
    } else {
      res.render('teams', { teams: [] });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function() {
  console.log(`Application started on http://localhost:${app.get('port')}`);
});
