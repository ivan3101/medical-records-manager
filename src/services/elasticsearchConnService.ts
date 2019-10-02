import { Client } from "elasticsearch";
import { variables } from "../config/globals";

export class ElasticsearchConnService {
  public static getClassInstance(): ElasticsearchConnService {
    if (!ElasticsearchConnService.classInstance) {
      ElasticsearchConnService.classInstance = new ElasticsearchConnService();
    }

    return ElasticsearchConnService.classInstance
  }

  private static classInstance: ElasticsearchConnService;


  private elasticInstance = new Client({
    host: variables.elasticsearch_url
  });

  private constructor() {}
  
  public get ElasticInstance(): Client {
    return this.elasticInstance;
  }
}