export const mockAutoOrchestrateResult = {
  "received_command": "write a poem and then count its words",
  "auto_orchestrate_response": {
    "identified_role": "Content Writer",
    "role_confidence": 0.85,
    "role_method": "enhanced_prompting",
    "role_reasoning": "The command involves two main tasks: writing a poem and counting its words. The primary task type is Creative, as it involves creating literary content. The required expertise domain is writing, specifically in poetry, which does not demand highly specialized industry knowledge but does require a good command of language and creativity. The expected deliverable is a written poem, with an additional task of word counting, which is straightforward and typically involves a basic level of analytical skill. This is a simple task with a limited scope, needing primarily writing skills. Therefore, a Content Writer, who specializes in crafting written content and can perform basic word processing tasks, is the most appropriate professional role for this command.",
    "m_language_spec": "swarm poetry_swarm {\n    agent poet_agent {\n        role: \"Creative Writer\"\n        capabilities: \"llm\"\n        inputs: \"poem_request\"\n        outputs: \"poem_output\"\n        config: { model: \"gpt-4\", temperature: 0.7 }\n    }\n    agent word_counter_agent {\n        role: \"Word Counter\"\n        capabilities: \"llm,analysis\"\n        inputs: \"poem_output\"\n        outputs: \"word_count\"\n        config: { model: \"gpt-4\", temperature: 0.5 }\n    }\n    workflow sequential {\n        poet_agent(input: \"poem_request\", output: \"poem_output\")\n        word_counter_agent(input: \"poem_output\", output: \"word_count\")\n    }\n}",
    "swarm_result": {
      "success": true,
      "swarm_spec": {
        "type": "swarm",
        "name": "poetry_swarm",
        "agents": {
          "poet_agent": {
            "name": "poet_agent",
            "role": "Creative Writer",
            "capabilities": ["llm"],
            "inputs": ["poem_request"],
            "outputs": ["poem_output"],
            "config": {
              "model": "gpt-4",
              "temperature": 0.7
            },
            "type": "llm"
          },
          "word_counter_agent": {
            "name": "word_counter_agent",
            "role": "Word Counter",
            "capabilities": ["llm", "analysis"],
            "inputs": ["poem_output"],
            "outputs": ["word_count"],
            "config": {
              "model": "gpt-4",
              "temperature": 0.5
            },
            "type": "llm"
          },
          "quality_checker_agent": {
            "name": "quality_checker_agent",
            "role": "Quality Checker",
            "capabilities": ["llm", "validation"],
            "inputs": ["word_count"],
            "outputs": ["quality_report"],
            "config": {
              "model": "gpt-4",
              "temperature": 0.3
            },
            "type": "llm"
          },
          "formatter_agent": {
            "name": "formatter_agent",
            "role": "Document Formatter",
            "capabilities": ["formatting", "export"],
            "inputs": ["poem_output", "quality_report"],
            "outputs": ["formatted_document"],
            "config": {
              "format": "markdown"
            },
            "type": "formatter"
          }
        },
        "workflow": {
          "type": "sequential",
          "steps": [
            {
              "agent": "poet_agent",
              "inputs": ["poem_request"],
              "outputs": ["poem_output"],
              "transform": null,
              "filter": null,
              "timeout": null,
              "retry": null,
              "error_handler": null
            },
            {
              "agent": "word_counter_agent",
              "inputs": ["poem_output"],
              "outputs": ["word_count"],
              "transform": null,
              "filter": null,
              "timeout": null,
              "retry": null,
              "error_handler": null
            },
            {
              "agent": "quality_checker_agent",
              "inputs": ["word_count"],
              "outputs": ["quality_report"],
              "transform": null,
              "filter": null,
              "timeout": null,
              "retry": null,
              "error_handler": null
            },
            {
              "agent": "formatter_agent",
              "inputs": ["poem_output", "quality_report"],
              "outputs": ["formatted_document"],
              "transform": null,
              "filter": null,
              "timeout": null,
              "retry": null,
              "error_handler": null
            }
          ],
          "conditions": null,
          "max_iterations": null,
          "execution_strategy": "linear"
        },
        "config": {},
        "execution_plan": {
          "phases": [
            {
              "phase_id": 0,
              "step_id": 0,
              "agent": "poet_agent",
              "dependencies": [],
              "inputs": ["poem_request"],
              "outputs": ["poem_output"],
              "execution_type": "sequential"
            },
            {
              "phase_id": 1,
              "step_id": 1,
              "agent": "word_counter_agent",
              "dependencies": ["poet_agent"],
              "inputs": ["poem_output"],
              "outputs": ["word_count"],
              "execution_type": "sequential"
            }
          ],
          "dependencies": {
            "poet_agent": [],
            "word_counter_agent": ["poet_agent"]
          },
          "data_flow": {
            "poet_agent": {
              "inputs": ["poem_request"],
              "outputs": ["poem_output"],
              "transform": null,
              "filter": null
            },
            "word_counter_agent": {
              "inputs": ["poem_output"],
              "outputs": ["word_count"],
              "transform": null,
              "filter": null
            },
            "quality_checker_agent": {
              "inputs": ["word_count"],
              "outputs": ["quality_report"],
              "transform": null,
              "filter": null
            },
            "formatter_agent": {
              "inputs": ["poem_output", "quality_report"],
              "outputs": ["formatted_document"],
              "transform": null,
              "filter": null
            }
          },
          "error_handling": {},
          "monitoring": {}
        }
      }
    }
  }
};