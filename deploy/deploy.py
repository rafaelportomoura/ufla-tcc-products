from scripts.typescript import Typescript
from scripts.cloudformation import CloudFormation
from scripts.args import get_args
from stacks import ecs, ecr, api, bucket
from scripts.exception import DeployException
from scripts.docker import Docker
from scripts.ecs import ECS

args = get_args(
    {
        "stage": {"type": "str", "required": False, "default": "prod"},
        "microservice": {"type": "str", "required": False, "default": "products"},
        "tenant": {"type": "str", "required": False, "default": "tcc"},
        "region": {"type": "str", "required": False, "default": "us-east-2"},
        "profile": {"type": "str", "required": False, "default": "default"},
        "log_level": {"type": "int", "required": False, "default": 3},
        "account_id": {"type": "str", "required": True},
        "min_container": {"type": "int", "required": False, "default": 1},
        "max_container": {"type": "int", "required": True, "default": 1},
        "scale_out_cooldown": {"type": "int", "required": False, "default": 60},
        "scale_in_cooldown": {"type": "int", "required": False, "default": 60},
        "cpu_utilization": {"type": "int", "required": False, "default": 40},
        "authorizer_result_ttl_in_seconds": {
            "type": "int",
            "required": False,
            "default": 300,
        },
        "log_level_compute": {"type": "str", "required": False, "default": "debug"},
    }
)

microservice = args["microservice"]
stage = args["stage"]
tenant = args["tenant"]
region = args["region"]
profile = args["profile"]
log_level = args["log_level"]
account_id = args["account_id"]

cloudformation = CloudFormation(profile=profile, region=region, log_level=log_level)


exports = cloudformation.list_exports()
HOSTED_ZONE_ID = cloudformation.get_export_value(
    exports, f"{stage}-{tenant}-hosted-zone-id"
)
DOMAIN_NAME = cloudformation.get_export_value(exports, f"{stage}-{tenant}-domain-name")

CERTIFICATE_ARN = cloudformation.get_export_value(
    exports, f"{stage}-{tenant}-domain-certificate"
) if region == "us-east-1" else None
if region != "us-east-1":
    us_east_1_cloudformation = CloudFormation(profile=profile, region="us-east-1", log_level=log_level)
    exports = us_east_1_cloudformation.list_exports()
    us_east_1_cloudformation.get_export_value(
        exports, f"{stage}-{tenant}-domain-certificate"
    )

################################################
# 🚀 IMAGES
################################################
IMAGES_STACK = bucket.stack(stage=stage, tenant=tenant, microservice=microservice, hosted_zone_id=HOSTED_ZONE_ID, domain_name=DOMAIN_NAME)
cloudformation.deploy_stack(stack=IMAGES_STACK)
if not cloudformation.stack_is_succesfully_deployed(stack_name=IMAGES_STACK["stack_name"]):
    raise DeployException(stack=IMAGES_STACK)

################################################
# 🚀 ECR
################################################
typescript = Typescript()
ECR_STACK = ecr.stack(stage=stage, tenant=tenant, microservice=microservice)
cloudformation.deploy_stack(stack=ECR_STACK)
if cloudformation.stack_is_succesfully_deployed(stack_name=ECR_STACK["stack_name"]):
    ecr_uri = Docker.ecr_uri(account_id=account_id, region=region)
    typescript.build()
    image=f"{stage}-{tenant}-{microservice}"
    Docker.build_and_push(ecr_uri=ecr_uri,region=region, image=image, tag="latest")
else:
    raise DeployException(stack=ECR_STACK)

################################################
# 🚀 API_GATEWAY
################################################
exports = cloudformation.list_exports()
listener_arn = cloudformation.get_export_value(exports=exports, name=f"{stage}-{tenant}-application-load-balancer-listener-arn")

API_GATEWAY_STACK = api.stack(
    stage=stage,
    tenant=tenant,
    microservice=microservice,
    base_path=microservice,
    listener_arn=listener_arn,
    authorizer_result_ttl_in_seconds=args["authorizer_result_ttl_in_seconds"],
    log_level=args["log_level_compute"],
)

cloudformation.package_and_deploy_stack(stack=API_GATEWAY_STACK, output="stacks/output.yaml")

if not cloudformation.stack_is_succesfully_deployed(stack_name=API_GATEWAY_STACK["stack_name"]):
    raise DeployException(stack=API_GATEWAY_STACK)

################################################
# 🚀 ECS
################################################
exports = cloudformation.list_exports()
target = cloudformation.get_export_value(
    exports=exports, name=f"{stage}-{tenant}-{microservice}-target-group-arn"
)

ECS_STACK = ecs.stack(
    stage=stage,
    tenant=tenant,
    microservice=microservice,
    log_level=args["log_level_compute"],
    min_container=args["min_container"],
    max_container=args["max_container"],
    scale_out_cooldown=args["scale_out_cooldown"],
    scale_in_cooldown=args["scale_in_cooldown"],
    cpu_utilization=args["cpu_utilization"],
    target_group=target,
    images_url=f"https://{microservice}-images.{DOMAIN_NAME}",
)

cloudformation.deploy_stack(stack=ECS_STACK)
ecs = ECS(profile=profile, region=region, log_level=log_level)
if not cloudformation.stack_is_succesfully_deployed(stack_name=ECS_STACK["stack_name"]):
    raise DeployException(stack=ECS_STACK)

stack_resources = cloudformation.describe_stack_resources(stack_name=ECS_STACK["stack_name"])
print(stack_resources)
for resource in stack_resources["StackResources"]:
    if resource["LogicalResourceId"] == "Service":
        service = resource["PhysicalResourceId"]
        break

ecs.force_new_deployment(cluster=f"{stage}-{tenant}-{microservice}-cluster",service=service)
