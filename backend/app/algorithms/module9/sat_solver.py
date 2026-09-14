"""Brute-force Boolean Satisfiability (SAT) solver with exhaustive clause-level trace."""
import itertools
from typing import Any, Dict, List, Optional, Set, Tuple


def get_default_sat_data() -> Dict[str, Any]:
    """Return a standard CNF formula for visualization.

    Default formula: (x1 OR ~x2) AND (~x1 OR x3) AND (x2 OR ~x3)
    Satisfiable by e.g. x1=True, x2=True, x3=True.
    """
    return {
        "variables": ["x1", "x2", "x3"],
        "clauses": [
            ["x1", "~x2"],
            ["~x1", "x3"],
            ["x2", "~x3"],
        ],
    }


def parse_literal(literal: str) -> Tuple[str, bool]:
    """Parse a literal into (variable_name, is_positive).

    e.g. "x1" -> ("x1", True)
         "~x1" -> ("x1", False)
         "!x1" -> ("x1", False)
    """
    s = str(literal).strip()
    if not s:
        raise ValueError("Empty literal encountered.")
    if s.startswith("~") or s.startswith("!"):
        var_name = s[1:].strip()
        if not var_name:
            raise ValueError(f"Invalid negated literal: '{literal}'")
        return var_name, False
    return s, True


def run_sat_solver(
    variables: Optional[List[str]] = None,
    clauses: Optional[List[List[str]]] = None,
    stop_on_first_satisfying: bool = True,
) -> Dict[str, Any]:
    """Execute brute-force SAT solver enumerating 2^n truth assignments with clause-level evaluation.

    Args:
        variables: List of unique variable names.
        clauses: List of clauses in CNF, where each clause is a list of literals.
        stop_on_first_satisfying: If True, halts upon finding the first valid assignment.

    Returns:
        Dict containing:
            - steps: Detailed evaluation steps for each assignment
            - is_satisfiable: Boolean SAT/UNSAT result
            - satisfying_assignment: Dict mapping variables to bool if SAT, else None
            - total_assignments: Total possible assignments (2^n)
            - assignments_checked: Number of evaluated assignments
            - early_termination: Whether search stopped early upon satisfying assignment
            - variables: List of variable names
            - clauses: List of clauses
            - metrics: Summary operational counters
    """
    if variables is None or clauses is None:
        default = get_default_sat_data()
        variables = default["variables"]
        clauses = default["clauses"]

    # Validation
    if not isinstance(variables, list) or len(variables) == 0:
        raise ValueError("Variables list must be a non-empty list.")
    if len(variables) > 12:
        raise ValueError("Variable count cannot exceed 12 for server-side brute-force execution (2^12 = 4096 assignments).")

    # Check variable uniqueness and names
    clean_vars: List[str] = []
    seen_vars: Set[str] = set()
    for v in variables:
        v_str = str(v).strip()
        if not v_str:
            raise ValueError("Variable names cannot be empty.")
        if v_str.startswith("~") or v_str.startswith("!"):
            raise ValueError(f"Variable name '{v_str}' must not start with negation.")
        if v_str in seen_vars:
            raise ValueError(f"Duplicate variable name: '{v_str}'")
        seen_vars.add(v_str)
        clean_vars.append(v_str)

    if not isinstance(clauses, list) or len(clauses) == 0:
        raise ValueError("Clauses must be a non-empty list of clauses.")
    if len(clauses) > 30:
        raise ValueError("Clause count cannot exceed 30.")

    parsed_clauses: List[List[Tuple[str, bool, str]]] = []
    for c_idx, clause in enumerate(clauses):
        if not isinstance(clause, list) or len(clause) == 0:
            raise ValueError(f"Clause {c_idx} must be a non-empty list of literals.")
        parsed_clause: List[Tuple[str, bool, str]] = []
        for lit in clause:
            var_name, is_pos = parse_literal(lit)
            if var_name not in seen_vars:
                raise ValueError(f"Clause {c_idx} references undeclared variable '{var_name}'.")
            raw_lit = str(lit).strip()
            parsed_clause.append((var_name, is_pos, raw_lit))
        parsed_clauses.append(parsed_clause)

    total_possible = 2 ** len(clean_vars)
    steps: List[Dict[str, Any]] = []

    is_satisfiable = False
    satisfying_assignment: Optional[Dict[str, bool]] = None
    assignments_checked = 0
    early_termination = False

    # Enumerate all 2^n assignments in standard binary order (False, True)
    for assignment_tuple in itertools.product([False, True], repeat=len(clean_vars)):
        assignments_checked += 1
        current_assignment = dict(zip(clean_vars, assignment_tuple))

        # Evaluate each clause
        clause_evaluations: List[Dict[str, Any]] = []
        all_clauses_satisfied = True

        for c_idx, parsed_clause in enumerate(parsed_clauses):
            clause_satisfied = False
            satisfying_literals: List[str] = []

            literal_details: List[Dict[str, Any]] = []
            for var_name, is_pos, raw_lit in parsed_clause:
                var_val = current_assignment[var_name]
                lit_val = var_val if is_pos else (not var_val)
                literal_details.append({
                    "literal": raw_lit,
                    "variable": var_name,
                    "var_value": var_val,
                    "lit_value": lit_val,
                })
                if lit_val:
                    clause_satisfied = True
                    satisfying_literals.append(raw_lit)

            clause_evaluations.append({
                "clause_index": c_idx,
                "clause_str": " ∨ ".join([lit for _, _, lit in parsed_clause]),
                "literals": literal_details,
                "satisfied": clause_satisfied,
                "satisfying_literals": satisfying_literals,
            })

            if not clause_satisfied:
                all_clauses_satisfied = False

        if all_clauses_satisfied:
            is_satisfiable = True
            satisfying_assignment = dict(current_assignment)

        # Build detailed step description
        assignment_str = ", ".join([f"{k}={v}" for k, v in current_assignment.items()])
        if all_clauses_satisfied:
            desc = f"Assignment #{assignments_checked} ({assignment_str}) SATISFIES all {len(clauses)} clauses! Formula is SAT."
        else:
            unsat_clauses = [str(c["clause_index"] + 1) for c in clause_evaluations if not c["satisfied"]]
            desc = f"Assignment #{assignments_checked} ({assignment_str}) fails clause(s): {', '.join(unsat_clauses)}."

        steps.append({
            "step_index": len(steps),
            "assignment_number": assignments_checked,
            "total_assignments": total_possible,
            "variable_values": dict(current_assignment),
            "clause_evaluations": clause_evaluations,
            "all_satisfied": all_clauses_satisfied,
            "is_satisfying_found": is_satisfiable,
            "satisfying_assignment": satisfying_assignment,
            "description": desc,
        })

        if all_clauses_satisfied and stop_on_first_satisfying:
            early_termination = True
            break

    metrics = {
        "variables_count": len(clean_vars),
        "clauses_count": len(clauses),
        "total_possible_assignments": total_possible,
        "assignments_checked": assignments_checked,
        "is_satisfiable": is_satisfiable,
        "early_termination": early_termination,
    }

    return {
        "steps": steps,
        "is_satisfiable": is_satisfiable,
        "satisfying_assignment": satisfying_assignment,
        "total_assignments": total_possible,
        "assignments_checked": assignments_checked,
        "early_termination": early_termination,
        "variables": clean_vars,
        "clauses": clauses,
        "metrics": metrics,
    }
