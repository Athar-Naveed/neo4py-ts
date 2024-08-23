import neo4j,{Driver} from "neo4j-driver";


class Graph{
    /*Graph

    Constructor:
        The constructor of the Graph class takes 2 parameters  - uri and Auth. Default params for uri and Auth are available, if you won't provide it.

        Params:
        uri (str): A string representing a URI to connect to Neo4j database, e.g., bolt://localhost:7687
        Auth (tuple): A tuple containing username and password for authentication against Neo4j Database.

    Run method:
        This is the main method that should be called after creating an instance of this class. It runs a Cypher query on the connected graph database
        to create or read a data from the node in Neo4j.

        Params:
        query (str): It takes a cypher query.
        **kwargs (dict): It takes the data in the dictionary format.

        Return:
        It returns the summary, and the keys of the result obtained by executing the query on the database.
    */
    private driver:Driver | undefined;
    constructor(){
        this.driver = undefined;
        this.connection()
    }
    private async connection(uri:string="bolt://localhost:7687",dbName:string="neo4j",dbPassword="12345678"):Promise<void>{
        try {
            this.driver = neo4j.driver(uri,neo4j.auth.basic(dbName,dbPassword));
            const serverInfo = await this.driver.getServerInfo();
            console.log("Connecting with database");
            console.log(serverInfo);
            console.log("Connection established");
        } catch (error:any) {
            console.error(`Error connecting to db instance cause: ${error}`);
        }
    }
    async closeConnection(){
        if(this.driver){
            await this.driver.close();
            console.log("Connection closed");
        } else{
            console.log("No active connection to close");
        }
    }
    async run(query:string,params?:Object):Promise<Array<Object>>{
        /*run method

        Params:
            query (str): It'll take user written cypher query, and pass it to execute_query method.
            **kwargs (object): It can receive any number of keyword arguments which will be passed into the cypher query in execute_query method using object.

        Returns:
            resp (array of object): It'll return the data in the form of array of objects, which you can iterate over to access your desired data.
            summary,keys (array): By default, a array will be returned that will contain the summary of the executed query and the keys.
        
        Example code:
            graph = Graph("connection_string",("username","password")) \n
            data = { \n
                "name":"Athar Naveed", \n
                "age":25 \n
            }
            query = "CREATE (p:Person {name:$name,age:$age}) return p" \n
            graph.run(query,**data) \n
        */
        try {
            if(!this.driver){
                throw new Error("No active connection to run query");
            }
            const session = this.driver.session();
            const result = await session.run(query,params);
            // const summary = result.summary;
            console.log(`result: ${result.records}`);
            const keys = result.records.map((record:any) => record._fields[0].properties);
            console.log(`keys: ${keys}`);
            session.close();
            return keys;
        } catch (error:any) {
            console.error(`Error running query cause: ${error}`);
            return [];
        }
    }
    
}

let graph = new Graph();
graph.run("CREATE (p:Human {name:$name,age:$age})",{"name":"Naved","age":50}).then((result) => console.log(result)).finally(()=>graph.closeConnection());