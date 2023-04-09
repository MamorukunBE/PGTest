import { Connection, Pool, DataTypeOIDs } from 'postgresql-client';
import RandomTextGenerator from 'random-text-generator';

let randomTextGenerator = new RandomTextGenerator();
let americanCities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville", "Fort Worth", "Columbus", "San Francisco", "Charlotte", "Indianapolis", "Seattle", "Denver", "Washington", "Boston", "El Paso", "Detroit", "Nashville", "Portland", "Memphis", "Oklahoma City", "Las Vegas", "Louisville", "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno", "Mesa", "Sacramento", "Atlanta", "Kansas City", "Colorado Springs", "Miami", "Raleigh", "Omaha", "Long Beach", "Virginia Beach", "Oakland", "Minneapolis", "Tulsa", "Arlington", "Tampa", "New Orleans", "Wichita", "Cleveland", "Bakersfield", "Aurora", "Anaheim", "Honolulu", "Santa Ana", "Riverside", "Corpus Christi", "Lexington", "Stockton", "Henderson", "Saint Paul", "St. Louis", "Cincinnati", "Pittsburgh", "Greensboro", "Anchorage", "Plano", "Lincoln", "Orlando", "Irvine", "Newark", "Toledo", "Durham", "Chula Vista", "Fort Wayne", "Jersey City", "St. Petersburg", "Laredo", "Madison", "Chandler", "Buffalo", "Lubbock", "Scottsdale", "Reno", "Glendale", "Gilbert", "Winston–Salem", "North Las Vegas", "Norfolk", "Chesapeake", "Garland", "Irving", "Hialeah", "Fremont", "Boise", "Richmond", "Baton Rouge", "Spokane", "Des Moines", "Tacoma", "San Bernardino", "Modesto", "Fontana", "Santa Clarita", "Birmingham", "Oxnard", "Fayetteville", "Moreno Valley", "Rochester", "Glendale", "Huntington Beach", "Salt Lake City", "Grand Rapids", "Amarillo", "Yonkers", "Aurora", "Montgomery", "Akron", "Little Rock", "Huntsville", "Augusta", "Port St. Lucie", "Grand Prairie", "Columbus", "Tallahassee", "Overland Park", "Tempe", "McKinney", "Mobile", "Cape Coral", "Shreveport", "Frisco", "Knoxville", "Worcester", "Brownsville", "Vancouver", "Fort Lauderdale", "Sioux Falls", "Ontario", "Chattanooga", "Providence", "Newport News", "Rancho Cucamonga", "Santa Rosa", "Oceanside", "Salem", "Elk Grove", "Garden Grove", "Pembroke Pines", "Peoria", "Eugene", "Corona", "Cary", "Springfield", "Fort Collins", "Jackson", "Alexandria", "Hayward", "Lancaster", "Lakewood", "Clarksville", "Palmdale", "Salinas", "Springfield", "Hollywood", "Pasadena", "Sunnyvale", "Macon", "Kansas City", "Pomona", "Escondido", "Killeen", "Naperville", "Joliet", "Bellevue", "Rockford", "Savannah", "Paterson", "Torrance", "Bridgeport", "McAllen", "Mesquite", "Syracuse", "Midland", "Pasadena", "Murfreesboro", "Miramar", "Dayton", "Fullerton", "Olathe", "Orange", "Thornton", "Roseville", "Denton", "Waco", "Surprise", "Carrollton", "West Valley City", "Charleston", "Warren", "Hampton", "Gainesville", "Visalia", "Coral Springs", "Columbia", "Cedar Rapids", "Sterling Heights", "New Haven", "Stamford", "Concord", "Kent", "Santa Clara", "Elizabeth", "Round Rock", "Thousand Oaks", "Lafayette", "Athens", "Topeka", "Simi Valley", "Fargo", "Norman", "Columbia", "Abilene", "Wilmington", "Hartford", "Victorville", "Pearland", "Vallejo", "Ann Arbor", "Berkeley", "Allentown", "Richardson", "Odessa", "Arvada", "Cambridge", "Sugar Land", "Beaumont", "Lansing", "Evansville", "Rochester", "Independence", "Fairfield", "Provo", "Clearwater", "College Station", "West Jordan", "Carlsbad", "El Monte", "Murrieta", "Temecula", "Springfield", "Palm Bay", "Costa Mesa", "Westminster", "North Charleston", "Miami Gardens", "Manchester", "High Point", "Downey", "Clovis", "Pompano Beach", "Pueblo", "Elgin", "Lowell", "Antioch", "West Palm Beach", "Peoria", "Everett", "Ventura", "Centennial", "Lakeland", "Gresham", "Richmond", "Billings", "Inglewood", "Broken Arrow", "Sandy Springs", "Jurupa Valley", "Hillsboro", "Waterbury", "Santa Maria", "Boulder", "Greeley", "Daly City", "Meridian", "Lewisville", "Davie", "West Covina", "League City", "Tyler", "Norwalk", "San Mateo", "Green Bay", "Wichita Falls", "Sparks", "Lakewood", "Burbank", "Rialto", "Allen", "El Cajon", "Las Cruces", "Renton", "Davenport", "South Bend", "Vista", "Tuscaloosa", "Clinton", "Edison", "Woodbridge", "San Angelo", "Kenosha", "Vacaville"];
for (let americanCity of americanCities) randomTextGenerator.learn(americanCity);
//-----
const MASTERpool = new Pool({
	host: 'postgres://postgres@192.168.1.57:5432',
	pool: {
		min: 1,
		max: 10,
		idleTimeoutMillis: 5000
	},
	acquireMaxRetries: 2,
	validation: true,
	autoCommit: false
});

await Promise.all([{
	name: 'base',
	struct: 'id serial PRIMARY KEY, value VARCHAR(50), created_on TIMESTAMP NOT NULL',
	insert: '(id, value, created_on) VALUES($1, $2, now())',
	insertStruct: [DataTypeOIDs.Int4, DataTypeOIDs.Varchar],
	maxCount: 1000000
}, {
	name: 'base_sub1',
	struct: 'id serial PRIMARY KEY, base_id serial, value VARCHAR(50), created_on TIMESTAMP NOT NULL',
	insert: '(id, base_id, value, created_on) VALUES($1, $3, $2, now())',
	insertStruct: [DataTypeOIDs.Int4, DataTypeOIDs.Varchar, DataTypeOIDs.Int4],
	maxCount: 2000000
}, {
	name: 'base_sub2',
	struct: 'id serial PRIMARY KEY, base_sub1_id serial, value VARCHAR(50), created_on TIMESTAMP NOT NULL',
	insert: '(id, base_sub1_id, value, created_on) VALUES($1, $3, $2, now())',
	insertStruct: [DataTypeOIDs.Int4, DataTypeOIDs.Varchar, DataTypeOIDs.Int4],
	maxCount: 4000000
}].map(async (table, tableIdx, self) => {
	let MASTERcon = await MASTERpool.acquire();
	//=====
	await MASTERcon.query(`CREATE TABLE IF NOT EXISTS ${table.name} (${table.struct});`);
	await MASTERcon.query(`DROP INDEX IF EXISTS ${table.name}_pkey;`);
	//-----
	let res = await MASTERcon.query(`SELECT COUNT(*) AS count FROM ${table.name};`);
	let curCount = res.rows[0][res.fields.filter(f => f.fieldName === 'count')[0].columnId];
	let statement = await MASTERcon.prepare(`INSERT INTO ${table.name}${table.insert}`, { paramTypes: table.insertStruct });
	for (curCount; curCount < table.maxCount; curCount++) {
		if (curCount % 512 === 0) {
			if (curCount > 0)
				await MASTERcon.commit(),
			await MASTERcon.startTransaction();
			console.log(`${table.name}: [${curCount}/${table.maxCount}]`);
		}
		//-----
		let insertValues = [curCount, randomTextGenerator.generate()];
		if (table.name !== 'base')
			insertValues.push(Math.floor(Math.random() * self[tableIdx - 1].maxCount));
		await statement.execute({ params: insertValues });
	}
	await MASTERcon.commit(),
	console.log(`${table.name}: [${curCount}/${table.maxCount}]`);
	//-----
	await MASTERcon.query(`CREATE UNIQUE INDEX ${table.name}_pkey ON ${table.name} USING btree (id);`);
	//=====
	await MASTERpool.release(MASTERcon);
}));

await MASTERcon.close();
