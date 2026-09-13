"""Seed script to populate initial DAA curriculum modules."""
import sys
import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base_class import Base
from app.models.module import Module

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# 10 DAA Curriculum Modules
DAA_MODULES: List[Dict[str, any]] = [
    {
        "order_index": 1,
        "name": "Algorithm Analysis",
        "description": "Foundations of asymptotic analysis, Big-O, Big-Omega, Big-Theta notation, recurrence relations, and Master Theorem.",
    },
    {
        "order_index": 2,
        "name": "Divide & Conquer",
        "description": "Technique of dividing problems into subproblems, solving recursively, and combining solutions (Merge Sort, Quick Sort, Binary Search).",
    },
    {
        "order_index": 3,
        "name": "Backtracking",
        "description": "Systematic search through candidate solutions with pruning (N-Queens, Sudoku Solver, Subset Sum, Hamiltonian Cycle).",
    },
    {
        "order_index": 4,
        "name": "Dynamic Programming I",
        "description": "Optimal substructure and overlapping subproblems: memoization, tabulation, 0/1 Knapsack, and Longest Common Subsequence.",
    },
    {
        "order_index": 5,
        "name": "Dynamic Programming II",
        "description": "Advanced dynamic programming paradigms: Matrix Chain Multiplication, Bellman-Ford, Floyd-Warshall, and Edit Distance.",
    },
    {
        "order_index": 6,
        "name": "Greedy Method I",
        "description": "Locally optimal choice strategy: Fractional Knapsack, Activity Selection Problem, and Huffman Coding.",
    },
    {
        "order_index": 7,
        "name": "Greedy Method II",
        "description": "Greedy graph algorithms: Minimum Spanning Trees (Kruskal's, Prim's algorithms) and Dijkstra's Shortest Path algorithm.",
    },
    {
        "order_index": 8,
        "name": "Branch & Bound",
        "description": "State space tree search with bounding functions for optimization problems (Travelling Salesperson Problem, 0/1 Knapsack B&B).",
    },
    {
        "order_index": 9,
        "name": "P and NP Problems",
        "description": "Complexity classes: Deterministic vs. Non-deterministic polynomial time algorithms, verification, and decision problems.",
    },
    {
        "order_index": 10,
        "name": "NP-Hard & NP-Complete",
        "description": "Polynomial-time reductions, Cook-Levin theorem, 3-SAT, Clique, Vertex Cover, and approximation algorithms.",
    },
]


def seed_modules(db: Session) -> None:
    """Idempotently seed the 10 DAA curriculum modules."""
    logger.info("Seeding DAA curriculum modules...")
    inserted_count = 0
    updated_count = 0

    for item in DAA_MODULES:
        order = item["order_index"]
        name = item["name"]
        description = item["description"]

        # Check by order_index first, then name
        existing = db.query(Module).filter(
            (Module.order_index == order) | (Module.name == name)
        ).first()

        if existing:
            existing.order_index = order
            existing.name = name
            existing.description = description
            updated_count += 1
            logger.info(f"Updated Module {order}: '{name}'")
        else:
            module = Module(
                order_index=order,
                name=name,
                description=description,
            )
            db.add(module)
            inserted_count += 1
            logger.info(f"Inserted Module {order}: '{name}'")

    db.commit()
    logger.info(
        f"Seeding completed successfully: {inserted_count} inserted, {updated_count} updated (Total 10 modules)."
    )


def main() -> None:
    """Main execution function."""
    # Ensure tables exist (helpful for local development/sqlite tests)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        seed_modules(db)
    except Exception as e:
        logger.error(f"Error during seeding: {e}", exc_info=True)
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
