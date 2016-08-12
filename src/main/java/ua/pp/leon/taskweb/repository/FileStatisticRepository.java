package ua.pp.leon.taskweb.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ua.pp.leon.taskweb.domain.FileStatistic;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
public interface FileStatisticRepository extends JpaRepository<FileStatistic, Long> {
    //
}
