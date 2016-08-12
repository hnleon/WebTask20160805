package ua.pp.leon.taskweb.repository;

import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RestResource;
import ua.pp.leon.taskweb.domain.LineStatistic;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
public interface LineStatisticRepository extends JpaRepository<LineStatistic, Long> {

//    @RestResource(path = "findByFileId/{fileId}", rel = "findByFileId/{fileId}")
//    Collection<LineStatistic> findByFileId(@Param("fileId") Long fileId);
    @RestResource(rel = "/{fileId}")
    Collection<LineStatistic> findByFileId(@Param("fileId") Long fileId);
}
