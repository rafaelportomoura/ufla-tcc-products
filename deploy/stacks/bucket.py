from stacks.template_path import path
from scripts.stacks import Stack, stack_name


def my_stack_name(stage: str, tenant: str) -> str:
    return stack_name(stage=stage, tenant=tenant, name="Products-Bucket")


def stack(
    stage: str,
    tenant: str,
    microservice: str,
    domain_name: str,
) -> Stack:
    return Stack(
        template=path("stacks", "imageBucket.yaml"),
        stack_name=my_stack_name(stage, tenant),
        parameters={
            "Stage": stage,
            "Tenant": tenant,
            "Microservice": microservice,
            "DomainName": domain_name,
        },
    )
