// Importeer het npm pakket express uit de node_modules map
import express from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

import { AwesomeGraphQLClient } from 'awesome-graphql-client'
// Maak een nieuwe express app aan
const app = express();

// Stel ejs in als template engine
app.set('view engine', 'ejs');

// Stel de map met ejs templates in
app.set('views', './views');

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'));

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}));

// API naar hygraph

const client = new AwesomeGraphQLClient({
  endpoint:
    'https://eu-central-1-shared-euc1-02.cdn.hygraph.com/content/clvw76z7t00aq07uzaijft13n/master',
  fetch,
});

app.get('/', async (request, response) => {
  const team = `
  { 
    teams {
      name
      slug
    }
  }
`;

const employee = `
{
  employees {
    name
    age
    role
   avatar {
     url
   }
   team{
    name
   }
  }
}`;

const { teams } = await client.request(team);
const { employees } = await client.request(employee);

response.render('index', { teams, employees});
});

app.get('/team/:slug', async function (req, res) {
  const team = `
    query TeamsPageQuery($slug: String!) {
      teams(where: { slug: $slug }) {
        name
        slug
        employees {
          name
          age
          role
          cupsOfCoffee
          sickdays
          vacationdays
        }
      }
    }
  `;

  const { slug } = req.params;

  const {teams} = await client.request(team, { slug });
  console.log({teams});
  res.render('teams', {teams});
});

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000);

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function() {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`);
});

