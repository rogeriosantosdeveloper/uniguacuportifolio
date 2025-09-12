package com.portifolio.uniguacu.repository;

import com.portifolio.uniguacu.model.TestEntidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestEntidadeRepository extends JpaRepository<TestEntidade, Long> {
}