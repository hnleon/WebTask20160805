package ua.pp.leon.taskweb.controller;

import java.util.Collection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.ExposesResourceFor;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import ua.pp.leon.taskweb.domain.LineStatistic;
import ua.pp.leon.taskweb.repository.LineStatisticRepository;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
@RestController
@RequestMapping("/api")
@ExposesResourceFor(LineStatistic.class)
public class FileStatisticRestController {

    @RequestMapping(value = "{fileId}/lines", method = RequestMethod.GET)
    Collection<LineStatistic> readBookmarks(@PathVariable Long fileId) {
        return lineStatisticRepository.findByFileId(fileId);
    }

    @Autowired
    private LineStatisticRepository lineStatisticRepository;
}
